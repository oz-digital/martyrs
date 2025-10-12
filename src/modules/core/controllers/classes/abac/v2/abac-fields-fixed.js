// @martyrs/src/modules/core/controllers/classes/abac/abac.fields.js
import set from 'lodash/set';
import get from 'lodash/get';
import unset from 'lodash/unset';
import cloneDeep from 'lodash/cloneDeep';

export default class ABACFields {
  constructor(abac) {
    this.abac = abac;
    this.configs = new Map();
    this.compiledPatterns = new Map(); // Кэш скомпилированных паттернов
  }

  /**
   * Регистрация field policies
   */
  registerFieldsPolicy(resourceName, config) {
    const normalized = {};
    
    for (const [pattern, conf] of Object.entries(config)) {
      const { actions, ...baseSettings } = conf;
      
      const base = {
        actions: baseSettings.actions || '*',
        access: baseSettings.access || 'allow',
        validator: baseSettings.validator || null,
        transform: baseSettings.transform || null,
        rule: baseSettings.rule || 'remove',
        force: baseSettings.force || false,
        pattern
      };
      
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
    // Очищаем кэш паттернов при изменении конфига
    this.compiledPatterns.delete(resourceName);
    return this;
  }

  /**
   * Проверка доступа к полям
   */
  async checkFields(context, data, action = null) {
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

    // Применяем расширения
    await this._applyExtensions(normalizedContext);

    // Используем structuredClone или lodash для безопасного клонирования
    const result = {
      allowed: this._deepClone(data),
      denied: [],
      errors: [],
      transformed: null
    };

    // Собираем правила с учетом force
    const rules = this._collectRulesOptimized(data, config, fieldAction, resource);
    const forced = rules.filter(r => r.rule.force);
    const regular = rules.filter(r => !r.rule.force);
    
    // Set для отслеживания обработанных путей (БЫЛ БАГ!)
    const processed = new Set();

    // Применяем правила (сначала forced, потом обычные)
    for (const { path, value, rule } of [...forced, ...regular]) {
      // Пропускаем уже обработанные пути
      if (processed.has(path)) continue;
      processed.add(path);

      // Проверка доступа
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
    result.transformed = this._deepClone(result.allowed);
    
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
      set(result.transformed, path, transformed);
    }

    return result;
  }

  /**
   * Применение расширений
   * @private
   */
  async _applyExtensions(context) {
    if (!this.abac.policies || !this.abac.policies.priorities.extensions.length) {
      return;
    }

    for (const [name, extensionFn] of this.abac.policies.priorities.extensions) {
      try {
        await extensionFn(context);
      } catch (error) {
        this.abac.logger?.error('Extension error', { name, error });
      }
    }
  }

  /**
   * Безопасное клонирование
   * @private
   */
  _deepClone(obj) {
    // Используем structuredClone если доступен (Node 17+)
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(obj);
      } catch (e) {
        // Fallback для циклических ссылок
      }
    }
    // Fallback на lodash
    return cloneDeep(obj);
  }

  /**
   * Оптимизированный сбор правил
   * @private
   */
  _collectRulesOptimized(data, config, action, resource) {
    const rules = [];
    
    // Компилируем паттерны если нужно
    const compiledPatterns = this._getCompiledPatterns(resource, config);
    
    // Проверяем есть ли паттерн "*" - если да, применяем его ко всем полям
    const hasWildcard = compiledPatterns.has('*');
    
    // Оптимизация: сначала собираем все пути
    const dataPaths = this._extractPathsOptimized(data);
    
    // Если есть wildcard, сразу добавляем правило для всех путей
    if (hasWildcard) {
      const wildcardConfig = config['*'];
      const rule = this._getRuleForAction(wildcardConfig, action);
      
      if (this._matchesAction(rule.actions, action)) {
        for (const path of dataPaths) {
          rules.push({
            path,
            value: get(data, path),
            rule
          });
        }
        // Если применили wildcard, можем не проверять другие паттерны
        return rules;
      }
    }
    
    // Проверяем остальные паттерны
    for (const path of dataPaths) {
      for (const [pattern, matcher] of compiledPatterns) {
        if (pattern === '*') continue; // Уже обработали
        
        if (matcher(path)) {
          const fieldConfig = config[pattern];
          const rule = this._getRuleForAction(fieldConfig, action);
          
          if (this._matchesAction(rule.actions, action)) {
            rules.push({
              path,
              value: get(data, path),
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
   * Получение скомпилированных паттернов
   * @private
   */
  _getCompiledPatterns(resource, config) {
    if (!this.compiledPatterns.has(resource)) {
      const compiled = new Map();
      
      for (const pattern of Object.keys(config)) {
        compiled.set(pattern, this._compilePattern(pattern));
      }
      
      this.compiledPatterns.set(resource, compiled);
    }
    
    return this.compiledPatterns.get(resource);
  }

  /**
   * Компиляция паттерна в функцию проверки
   * @private
   */
  _compilePattern(pattern) {
    if (pattern === '*') return () => true;
    
    // Преобразуем паттерн в регулярку
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^.]+')
      .replace(/\[\*\]/g, '\\[\\d+\\]');
    
    const regex = new RegExp(`^${escaped}$`);
    
    return (path) => regex.test(path);
  }

  /**
   * Оптимизированное извлечение путей
   * @private
   */
  _extractPathsOptimized(obj, prefix = '', paths = []) {
    if (!obj || typeof obj !== 'object') return paths;
    
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const path = prefix ? `${prefix}[${i}]` : `[${i}]`;
        paths.push(path);
        this._extractPathsOptimized(item, path, paths);
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const path = prefix ? `${prefix}.${key}` : key;
          paths.push(path);
          
          if (obj[key] && typeof obj[key] === 'object') {
            this._extractPathsOptimized(obj[key], path, paths);
          }
        }
      }
    }
    
    return paths;
  }

  /**
   * Получение правила для действия
   * @private
   */
  _getRuleForAction(fieldConfig, action) {
    if (fieldConfig.actions && fieldConfig.actions[action]) {
      return fieldConfig.actions[action];
    }
    return fieldConfig.base;
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
        return !!(await access(context, fieldPath, fieldValue));
      } catch (e) {
        this.abac.logger?.error('Field access check error', { 
          field: fieldPath, 
          error: e.message 
        });
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
      return await transform(value, context, fieldPath, currentData);
    } catch (error) {
      this.abac.logger?.error('Field transform error', { 
        field: fieldPath, 
        error: error.message 
      });
      return value;
    }
  }

  /**
   * Обработка отказа
   * @private
   */
  async _handleDenied(result, path, rule) {
    result.denied.push({ path, reason: rule });
    
    if (rule === 'remove') {
      unset(result.allowed, path);
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

  // Публичные методы для управления конфигами
  getConfig(resourceName) {
    return this.configs.get(resourceName);
  }

  hasConfig(resourceName) {
    return this.configs.has(resourceName);
  }

  removeConfig(resourceName) {
    this.compiledPatterns.delete(resourceName);
    return this.configs.delete(resourceName);
  }
}