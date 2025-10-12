// @martyrs/src/modules/core/controllers/classes/crud/crud.policies.js

/**
 * CRUDPolicies - всё связанное с ABAC
 * Задаетxf политики для проверки доступа и полей
 */
export default  class CRUDPolicies {
  constructor(crud) {
    this.crud = crud;
    this.abac = null;
    this.policyOptions = {};
    this.defaultPolicies = {};
  }

  // Инициализация с ABAC
  init(abac, policies = {}, fieldPolicies = null) {
    this.abac = abac;
    this.defaultPolicies = policies;
    
    // Field policies регистрируются в ABAC через crud.core.js
  }

  // Установка опций для конкретного действия
  setOptions(action, options) {
    this.policyOptions[action] = {
      enabled: options.enabled !== false,
      policies: options.policies || [],
      customPolicies: options.customPolicies || {},
      skipDefaultPolicies: options.skipDefaultPolicies || false,
      ...options
    };
  }

  // Получение опций для действия
  getOptions(action) {
    return this.policyOptions[action] || this.defaultPolicies[action] || {};
  }

  // Получение ABAC middleware для действия
  getPoliciesMiddleware(action) {
    if (!this.abac) return null;
    
    const options = this.getOptions(action);
    
    // Если ABAC отключен для этого действия
    if (options.enabled === false) {
      return null;
    }
    
    // Если указаны конкретные политики
    if (options.policies && options.policies.length > 0) {
      return this.abac.policyMiddleware(
        options.policies,
        options.customPolicies || {},
        {
          resource: this.crud.modelName,
          action,
          skipDefaultPolicies: options.skipDefaultPolicies
        }
      );
    }
    
    // Проверяем еще раз, чтобы убедиться что не отключено
    if (options.enabled === false) {
      return null;
    }
    
    // Дефолтный ABAC middleware
    return this.abac.middleware(this.crud.modelName, action, options);
  }

  // Получение middleware для проверки доступа к полям
  getFieldsMiddleware(action) {
    if (!this.abac) return null;
    
    return async (req, res, next) => {
      try {
        const data = req.verified || req.body;
        
        const context = {
          user: req.userId,
          resource: this.crud.modelName,
          action,
          req,
          data: {
            ...req.body,
            ...req.query,
            params: req.params,
          },
          params: req.params
        };

        if (req.skipFieldPolicies) {
          console.log('Skipping field policies for admin/moderator');
          req.verified = data;
          return next();
        }
        
        // Для update нужен текущий документ
        if (action === 'update' && data._id) {
          try {
            const current = await this.crud.model.findById(data._id);
            if (current) {
              context.currentResource = current;
            }
          } catch (err) {
            // Игнорируем ошибку, проверка на существование будет в service
          }
        }
        
        // Проверяем field policies через ABAC
        const fieldsResult = await this.abac.checkFields(
          context,
          data,
          action
        );
        
        if (fieldsResult.denied && fieldsResult.denied.length > 0) {
          return res.status(403).json({
            error: 'FIELD_ACCESS_DENIED',
            deniedFields: fieldsResult.denied.map(d => d.path)
          });
        }
        
        // Если есть ошибки валидации
        if (fieldsResult.errors && fieldsResult.errors.length > 0) {
          return res.status(400).json({
            error: 'FIELD_VALIDATION_ERROR',
            fields: fieldsResult.errors
          });
        }
        
        // Сохраняем отфильтрованные и трансформированные данные
        req.verified = fieldsResult.transformed || fieldsResult.allowed;
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Фильтрация полей для чтения (вызывается из controller после получения данных)
  async filterFieldsForRead(req, data) {
    if (!this.abac) {
      return data;
    }
    
    const context = {
      user: req.userId,
      resource: this.crud.modelName,
      action: 'read',
      req,
      data: {
        ...req.query,
        params: req.params,
      },
      params: req.params
    };
    
    // Если это массив документов
    if (Array.isArray(data)) {
      const results = [];
      for (const doc of data) {
        const fieldsResult = await this.abac.checkFields(
          { ...context, currentResource: doc },
          doc,
          'read'
        );
        results.push(fieldsResult.transformed || fieldsResult.allowed);
      }
      return results;
    }
    
    // Если это один документ
    const fieldsResult = await this.abac.checkFields(
      { ...context, currentResource: data },
      data,
      'read'
    );
    
    return fieldsResult.transformed || fieldsResult.allowed;
  }

  // Добавление кастомной политики
  addPolicy(action, policyName, policyFn = null) {
    if (!this.policyOptions[action]) {
      this.policyOptions[action] = {
        enabled: true,
        policies: [],
        customPolicies: {}
      };
    }
    
    // Если передана функция политики
    if (policyFn) {
      this.policyOptions[action].customPolicies[policyName] = policyFn;
    }
    
    // Добавляем имя политики в список
    if (!this.policyOptions[action].policies.includes(policyName)) {
      this.policyOptions[action].policies.push(policyName);
    }
  }

  // Удаление политики
  removePolicy(action, policyName) {
    if (!this.policyOptions[action]) return;
    
    const policies = this.policyOptions[action].policies;
    const index = policies.indexOf(policyName);
    
    if (index > -1) {
      policies.splice(index, 1);
    }
    
    delete this.policyOptions[action].customPolicies[policyName];
  }

  // Проверка наличия ABAC
  hasAbac() {
    return !!this.abac;
  }

  // Получение всех политик для действия
  getPolicies(action) {
    const options = this.getOptions(action);
    return {
      enabled: options.enabled !== false,
      policies: options.policies || [],
      customPolicies: options.customPolicies || {},
      defaultPolicies: this.defaultPolicies[action] || {}
    };
  }

  // Временное отключение ABAC для действия
  disableForAction(action) {
    if (!this.policyOptions[action]) {
      this.policyOptions[action] = {};
    }
    this.policyOptions[action].enabled = false;
  }

  // Включение ABAC для действия
  enableForAction(action) {
    if (!this.policyOptions[action]) {
      this.policyOptions[action] = {};
    }
    this.policyOptions[action].enabled = true;
  }

  // Установка политик по умолчанию для всех действий
  setDefaultPolicies(policies) {
    ['create', 'read', 'update', 'delete'].forEach(action => {
      if (!this.policyOptions[action]) {
        this.policyOptions[action] = {};
      }
      this.policyOptions[action].policies = [...policies];
    });
  }
}