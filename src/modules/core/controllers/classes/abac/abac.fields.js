// @martyrs/src/modules/core/controllers/classes/abac/abac.fields.js

export default class ABACFields {
  constructor(abac) {
    this.abac = abac;
    this.configs = new Map();
  }

  /**
   * Регистрация field policies
   */
  registerFieldsPolicy(resourceName, config) {
    const normalized = {};
    
    for (const [pattern, conf] of Object.entries(config)) {
      // Извлекаем базовые настройки (все кроме actions)
      const { actions, ...baseSettings } = conf;
      
      // Нормализуем базовые настройки
      const base = {
        actions: baseSettings.actions || '*',
        access: baseSettings.access || 'allow',
        validator: baseSettings.validator || null,
        transform: baseSettings.transform || null,
        rule: baseSettings.rule || 'remove',
        force: baseSettings.force || false,
        pattern
      };
      
      // Если есть переопределения для действий
      if (actions && typeof actions === 'object') {
        normalized[pattern] = {
          base,
          actions: Object.entries(actions).reduce((acc, [action, override]) => {
            acc[action] = { ...base, ...override };
            return acc;
          }, {})
        };
      } else {
        normalized[pattern] = { base };
      }
    }
    
    this.configs.set(resourceName, normalized);
    return this;
  }

  /**
   * Проверка доступа к полям
   */
  async checkFields(context, data, action = null) {
    // Используем нормализованный контекст из core
    const normalizedContext = this.abac.core.normalizeContext(context);
    
    if (normalizedContext.skipFieldPolicies) {
      return { 
        allowed: data, 
        denied: [], 
        errors: [], 
        transformed: data 
      };
    }

    const { resource } = normalizedContext;
    const fieldAction = action || normalizedContext.action;
    const config = normalizedContext.options?.fieldsConfig || this.configs.get(resource);
    
    if (!config) {
      return { allowed: data, denied: [], errors: [], transformed: data };
    }

    // Применяем расширения к контексту (если есть)
    if (this.abac.policies && this.abac.policies.priorities.extensions.length > 0) {
      for (const [name, extensionFn] of this.abac.policies.priorities.extensions) {
        try {
          await extensionFn(normalizedContext);
        } catch (error) {
          console.error(`Extension ${name} error:`, error);
        }
      }
    }

    const result = {
      allowed: JSON.parse(JSON.stringify(data)),
      denied: [],
      errors: [],
      transformed: null
    };

    // Собираем правила с учетом force
    const rules = this._collectRules(data, config, fieldAction);
    const forced = rules.filter(r => r.rule.force);
    const regular = rules.filter(r => !r.rule.force);

    // Применяем правила (сначала forced, потом обычные)
    for (const { path, value, rule } of [...forced, ...regular]) {
      const processed = new Set();
      
      // Пропускаем уже обработанные пути (для force)
      if (processed.has(path)) continue;
      processed.add(path);

      // Проверка доступа - передаем поле и значение как параметры
      const hasAccess = await this._checkFieldAccess(
        rule.access, 
        normalizedContext, 
        path, 
        value
      );
      
      if (!hasAccess) {
        await this._handleDenied(result, path, rule.rule);
        continue;
      }

      // Валидация
      if (rule.validator && rule.access !== 'optional') {
        const validation = await this._validateField(
          rule.validator, 
          value, 
          normalizedContext,
          path
        );
        
        if (!validation.isValid) {
          result.errors.push({ path, errors: validation.errors });
          
          if (rule.rule === 'error') {
            throw new Error(`Validation failed: ${path}`);
          }
          await this._handleDenied(result, path, rule.rule);
        }
      }
    }

    // Трансформация
    result.transformed = JSON.parse(JSON.stringify(result.allowed));
    
    for (const { path, value, rule } of [...forced, ...regular]) {
      if (!rule.transform) continue;
      
      const isDenied = result.denied.some(d => d.path === path);
      if (isDenied) continue;

      const transformed = await this._transformField(
        rule.transform,
        value,
        normalizedContext,
        path,
        result.transformed
      );
      this._setValue(result.transformed, path, transformed);
    }

    return result;
  }

  /**
   * Проверка доступа к полю
   * @private
   */
  async _checkFieldAccess(access, context, fieldPath, fieldValue) {
    if (access === 'allow') return true;
    if (access === 'deny') return false;
    if (access === 'optional') return true;
    
    if (typeof access === 'function') {
      try {
        // Передаем поле и значение как параметры функции
        return !!(await access(context, fieldPath, fieldValue));
      } catch (e) {
        console.error('Field access check error:', e);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Валидация поля
   * @private
   */
  async _validateField(validator, value, context, fieldPath) {
    if (typeof validator === 'function') {
      try {
        // Передаем контекст и путь как параметры
        const result = await validator(value, context, fieldPath);
        if (typeof result === 'boolean') {
          return { isValid: result, errors: result ? [] : ['Validation failed'] };
        }
        return result;
      } catch (e) {
        return { isValid: false, errors: [e.message] };
      }
    }
    
    if (validator && validator.validate) {
      return validator.validate(value);
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Трансформация поля
   * @private
   */
  async _transformField(transform, value, context, fieldPath, currentData) {
    try {
      // Передаем все необходимые данные как параметры
      return await transform(value, context, fieldPath, currentData);
    } catch (error) {
      console.error('Field transform error:', error);
      return value;
    }
  }

  /**
   * Сбор применимых правил
   * @private
   */
  _collectRules(data, config, action) {
    const rules = [];
    const patterns = Object.keys(config);
    
    // Оптимизация: сначала собираем все пути
    const dataPaths = this._extractPaths(data);
    
    for (const path of dataPaths) {
      for (const pattern of patterns) {
        if (this._matchesPattern(path, pattern)) {
          const fieldConfig = config[pattern];
          
          // Получаем правило для конкретного действия
          let rule;
          if (fieldConfig.actions && fieldConfig.actions[action]) {
            rule = fieldConfig.actions[action];
          } else {
            rule = fieldConfig.base;
          }
          
          // Проверяем, подходит ли правило для действия
          if (this._matchesAction(rule.actions, action)) {
            rules.push({
              path,
              value: this._getValue(data, path),
              rule
            });
            break; // Берем первое совпадение
          }
        }
      }
    }
    
    return rules;
  }

  /**
   * Проверка паттерна
   * @private
   */
  _matchesPattern(path, pattern) {
    if (pattern === path) return true;
    if (pattern === '*') return true;
    
    const pathParts = path.split('.');
    const patternParts = pattern.split('.');
    
    for (let i = 0; i < patternParts.length; i++) {
      const pp = patternParts[i];
      const pathPart = pathParts[i];
      
      if (pp === '**') return true;
      if (pp === '*' && pathPart !== undefined) continue;
      if (pp === '[*]' && /^\[\d+\]$/.test(pathPart)) continue;
      if (pp !== pathPart) return false;
    }
    
    return pathParts.length === patternParts.length;
  }

  /**
   * Извлечение путей
   * @private
   */
  _extractPaths(obj, prefix = '') {
    const paths = [];
    
    if (!obj || typeof obj !== 'object') return paths;
    
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const path = prefix ? `${prefix}[${i}]` : `[${i}]`;
        paths.push(path);
        paths.push(...this._extractPaths(item, path));
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const path = prefix ? `${prefix}.${key}` : key;
          paths.push(path);
          
          if (obj[key] && typeof obj[key] === 'object') {
            paths.push(...this._extractPaths(obj[key], path));
          }
        }
      }
    }
    
    return paths;
  }

  /**
   * Проверка доступа
   * @private
   */
  async _checkAccess(access, ctx) {
    if (access === 'allow') return true;
    if (access === 'deny') return false;
    if (access === 'optional') return true;
    
    if (typeof access === 'function') {
      try {
        return !!(await access(ctx));
      } catch (e) {
        console.error('Access check error:', e);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Валидация
   * @private
   */
  async _validate(validator, value, ctx) {
    if (typeof validator === 'function') {
      try {
        const result = await validator(value, ctx);
        if (typeof result === 'boolean') {
          return { isValid: result, errors: result ? [] : ['Validation failed'] };
        }
        return result;
      } catch (e) {
        return { isValid: false, errors: [e.message] };
      }
    }
    
    if (validator && validator.validate) {
      return validator.validate(value);
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Обработка отказа
   * @private
   */
  async _handleDenied(result, path, rule, ctx) {
    result.denied.push({ path, reason: rule });
    
    if (rule === 'remove') {
      this._removePath(result.allowed, path);
    } else if (rule === 'error') {
      throw new Error(`Access denied: ${path}`);
    }
  }

  /**
   * Проверка действия
   * @private
   */
  _matchesAction(actions, action) {
    if (actions === '*') return true;
    return Array.isArray(actions) ? actions.includes(action) : actions === action;
  }

  /**
   * Получение значения
   * @private
   */
  _getValue(obj, path) {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;
    
    for (const part of parts) {
      if (!current) return undefined;
      current = /^\d+$/.test(part) ? current[parseInt(part)] : current[part];
    }
    
    return current;
  }

  /**
   * Установка значения
   * @private
   */
  _setValue(obj, path, value) {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      const isArray = /^\d+$/.test(next);
      
      if (!current[part]) {
        current[part] = isArray ? [] : {};
      }
      current = current[part];
    }
    
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      current[parseInt(last)] = value;
    } else {
      current[last] = value;
    }
  }

  /**
   * Удаление пути
   * @private
   */
  _removePath(obj, path) {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;
    
    // Доходим до родителя
    for (let i = 0; i < parts.length - 1; i++) {
      const part = /^\d+$/.test(parts[i]) ? parseInt(parts[i]) : parts[i];
      if (!current[part]) return;
      current = current[part];
    }
    
    // Удаляем элемент
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      current.splice(parseInt(last), 1);
    } else {
      delete current[last];
    }
  }

  getConfig(resourceName) {
    return this.configs.get(resourceName);
  }

  hasConfig(resourceName) {
    return this.configs.has(resourceName);
  }

  removeConfig(resourceName) {
    return this.configs.delete(resourceName);
  }
}