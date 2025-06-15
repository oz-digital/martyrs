// @martyrs/src/modules/globals/controllers/classes/abac/abac.fields.js

/**
 * @typedef {Object} FieldConfig
 * @property {string[]|'*'} [actions=['*']] - Действия
 * @property {'allow'|'deny'|'optional'|Function} [access='allow'] - Правило доступа
 * @property {import('../globals.validator.js').default|Function} [validator] - Валидатор
 * @property {Function} [transform] - Трансформация (value, ctx) => any
 * @property {'remove'|'error'} [rule='remove'] - Действие при отказе в доступе
 * @property {boolean} [force=false] - Принудительное применение (высший приоритет)
 */

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
      normalized[pattern] = {
        actions: conf.actions || '*',
        access: conf.access || 'allow',
        validator: conf.validator || null,
        transform: conf.transform || null,
        rule: conf.rule || 'remove',
        force: conf.force || false,
        pattern
      };
    }
    
    this.configs.set(resourceName, normalized);
    return this;
  }

  /**
   * Проверка доступа к полям
   */
  async checkFields(context, data, action = null) {
    if (context.skipFieldPolicies) {
      console.log('Field policies skipped for admin/moderator');
      return { 
        allowed: data, 
        denied: [], 
        errors: [], 
        transformed: data 
      };
    }

    const { resource } = context;
    const fieldAction = action || context.action;
    const config = context.options?.fieldsConfig || this.configs.get(resource);
    
    if (!config) {
      return { allowed: data, denied: [], errors: [], transformed: data };
    }

    // ВАЖНО: Применяем расширения к контексту перед проверкой полей
    const enrichedContext = { ...context };
    
    // Проверяем, есть ли расширения в ABAC
    if (this.abac.policies && this.abac.policies.priorities.extensions.length > 0) {
      // Применяем расширения к контексту
      for (const [name, extensionFn] of this.abac.policies.priorities.extensions) {
        try {
          await extensionFn(enrichedContext);
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

    // Используем обогащенный контекст
    const ctx = { ...enrichedContext, fieldAction, cache: new Map(), originalData: data };


    // Собираем правила с учетом force
    const rules = this._collectRules(data, config, fieldAction);
    const forced = rules.filter(r => r.rule.force);
    const regular = rules.filter(r => !r.rule.force);

    // Применяем правила (сначала forced, потом обычные)
    for (const { path, value, rule } of [...forced, ...regular]) {
      const fieldCtx = { ...ctx, field: path, value };
      const processed = new Set();
      
      // Пропускаем уже обработанные пути (для force)
      if (processed.has(path)) continue;
      processed.add(path);

      // Проверка доступа
      const hasAccess = await this._checkAccess(rule.access, fieldCtx);
      
      if (!hasAccess) {
        await this._handleDenied(result, path, rule.rule, fieldCtx);
        continue;
      }

      // Валидация
      if (rule.validator && rule.access !== 'optional') {
        const validation = await this._validate(rule.validator, value, fieldCtx);
        
        if (!validation.isValid) {
          result.errors.push({ path, errors: validation.errors });
          
          if (rule.rule === 'error') {
            throw new Error(`Validation failed: ${path}`);
          }
          await this._handleDenied(result, path, rule.rule, fieldCtx);
        }
      }
    }

    // Трансформация
    result.transformed = JSON.parse(JSON.stringify(result.allowed));
    
    for (const { path, value, rule } of [...forced, ...regular]) {
      if (!rule.transform) continue;
      
      const isDenied = result.denied.some(d => d.path === path);
      if (isDenied) continue;

      const fieldCtx = { ...ctx, field: path, value, currentData: result.transformed };
      const transformed = await rule.transform(value, fieldCtx);
      this._setValue(result.transformed, path, transformed);
    }

    return result;
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
          const rule = config[pattern];
          
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