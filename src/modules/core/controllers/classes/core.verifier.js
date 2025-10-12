/**
 * @typedef {Object} ParamConfig
 * @property {('required'|'optional'|'forbidden'|Function)} rule - Правило доступа к параметру
 * @property {any} [default] - Значение по умолчанию
 * @property {Validator} [validator] - Валидатор для значений
 */
/**
 * @typedef {Object} VerifyOptions
 * @property {boolean} [applyDefaults=true] - Применять ли значения по умолчанию
 * @property {boolean} [removeInvalid=true] - Удалять ли невалидные параметры
 * @property {string[]} [only=null] - Валидировать только указанные параметры
 * @property {string[]} [except=null] - Исключить указанные параметры из валидации
 */
/**
 * @typedef {Object} VerifyResult
 * @property {Object} verifiedData - Проверенные данные
 * @property {Object} appliedDefaults - Примененные значения по умолчанию
 * @property {Object} removedParams - Удаленные параметры
 * @property {Object} untouchedParams - Нетронутые параметры
 * @property {boolean} isValid - Результат валидации
 * @property {Object<string, string[]>} verificationErrors - Ошибки валидации
 */
/**
 * Класс валидации query-параметров
 */
class Verifier {
  /**
   * @param {Object<string, ParamConfig>} config - Конфигурация параметров
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Получает правило доступа для параметра
   * @param {string} paramName - Имя параметра
   * @param {Object} context - Контекст для функции rule
   * @returns {string|Promise<string>} - Правило доступа
   */
  getRule(paramName, context = {}) {
    if (!this.config.hasOwnProperty(paramName)) {
      return 'optional';
    }

    const paramConfig = this.config[paramName];
    if (typeof paramConfig.rule === 'function') {
      return paramConfig.rule(context);
    }

    return paramConfig.rule;
  }

  /**
   * Проверяет отдельный параметр на соответствие конфигурации
   * @param {string} paramName - Имя параметра
   * @param {any} value - Значение для проверки
   * @param {Object} context - Контекст для функции rule
   * @returns {Object|Promise<Object>} - Результат проверки
   */
  verifyParam(paramName, value, context = {}) {
    const ruleResult = this.getRule(paramName, context);

    const processRule = (rule) => {
      if (rule === 'forbidden') {
        return { isValid: false, errors: [`Parameter '${paramName}' is forbidden`] };
      }

      if (rule === 'required' && value === undefined) {
        return { isValid: false, errors: [`Parameter '${paramName}' is required`] };
      }

      if (value === undefined) {
        return { isValid: true, errors: [] };
      }

      const paramConfig = this.config[paramName];
      if (paramConfig && paramConfig.validator) {
        return paramConfig.validator.validate(value);
      }

      return { isValid: true, errors: [] };
    };

    if (ruleResult instanceof Promise) {
      return ruleResult.then(processRule);
    }

    return processRule(ruleResult);
  }

  /**
   * Метод валидации входящего объекта
   * @param {Object} query - Объект параметров
   * @param {VerifyOptions} options - Опции проверки
   * @param {Object} context - Контекст для функции rule
   * @returns {VerifyResult|Promise<VerifyResult>} - Результат проверки
   */
  verify(query, options = {}, context = {}) {
    const { applyDefaults = true, removeInvalid = true, only = null, except = null } = options;

    const result = {
      verifiedData: {},
      appliedDefaults: {},
      removedParams: {},
      untouchedParams: {},
      isValid: true,
      verificationErrors: {},
    };

    const shouldVerifyParam = paramName => {
      if (only && Array.isArray(only)) return only.includes(paramName);
      if (except && Array.isArray(except)) return !except.includes(paramName);
      return true;
    };

    const paramPromises = [];
    const paramResults = {};

    for (const [paramName, paramConfig] of Object.entries(this.config)) {
      if (!shouldVerifyParam(paramName)) continue;

      const hasParam = query.hasOwnProperty(paramName);
      const value = hasParam ? query[paramName] : undefined;

      const verifyPromiseOrResult = this.verifyParam(paramName, value, context);

      if (verifyPromiseOrResult instanceof Promise) {
        paramPromises.push(
          verifyPromiseOrResult.then(validationResult => {
            paramResults[paramName] = {
              paramName,
              validationResult,
              hasParam,
              value,
              paramConfig
            };
          })
        );
      } else {
        paramResults[paramName] = {
          paramName,
          validationResult: verifyPromiseOrResult,
          hasParam,
          value,
          paramConfig
        };
      }
    }

    const processResults = () => {
      for (const { paramName, validationResult, hasParam, value, paramConfig } of Object.values(paramResults)) {
        if (!validationResult.isValid) {
          result.isValid = false;
          result.verificationErrors[paramName] = validationResult.errors;

          if (hasParam) {
            if (applyDefaults && paramConfig.default !== undefined) {
              result.verifiedData[paramName] = paramConfig.default;
              result.appliedDefaults[paramName] = paramConfig.default;
            } else if (removeInvalid) {
              result.removedParams[paramName] = value;
            } else {
              result.verifiedData[paramName] = value;
            }
          } else if (applyDefaults && paramConfig.default !== undefined) {
            result.verifiedData[paramName] = paramConfig.default;
            result.appliedDefaults[paramName] = paramConfig.default;
          }
        } else {
          if (hasParam) {
            result.verifiedData[paramName] = value;
          } else if (applyDefaults && paramConfig.default !== undefined) {
            result.verifiedData[paramName] = paramConfig.default;
            result.appliedDefaults[paramName] = paramConfig.default;
          }
        }
      }

      for (const [paramName, paramValue] of Object.entries(query)) {
        if (!this.config.hasOwnProperty(paramName)) {
          result.untouchedParams[paramName] = paramValue;
          result.verifiedData[paramName] = paramValue;
        }
      }

      if (Object.keys(result.verificationErrors).length === 0) {
        result.verificationErrors = null;
      }

      console.log('Verification result:', result);
      return result;
    };

    if (paramPromises.length > 0) {
      return Promise.all(paramPromises).then(() => processResults());
    }

    return processResults();
  }

  /**
   * Middleware для Express
   * @param {VerifyOptions} options - Опции проверки
   * @param {Function} [contextResolver] - Функция для получения контекста
   * @returns {function} - Middleware функция
   */
  middleware(options = {}, contextResolver = null) {
    return (req, res, next) => {
      try {
        const context = contextResolver ? contextResolver(req) : {};
        const result = this.verify(req.query, options, context);

        const processResult = (validationResult) => {
          req.queryValidation = validationResult;
          req.query = validationResult.verifiedData;
          next();
        };

        console.log('verifier result is', processResult)
        if (result instanceof Promise) {
          result.then(processResult).catch(next);
        } else {
          processResult(result);
        }
      } catch (error) {
        next(error);
      }
    };
  }
}

export default Verifier;