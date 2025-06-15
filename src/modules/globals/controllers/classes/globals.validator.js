// validator.js
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Успешность валидации
 * @property {string[]} errors - Список ошибок
 */
/**
 * @typedef {Object} ValidationOptions
 * @property {Object} [messages] - Пользовательские сообщения об ошибках
 * @property {string} [context] - Контекст для сообщений об ошибках
 */
/**
 * @typedef {Object} Rule
 * @property {string} type - Тип проверки
 * @property {(value: any) => boolean} check - Функция проверки
 * @property {any} [param] - Дополнительный параметр
 * @property {string} [message] - Сообщение об ошибке
 */
/**
 * Класс валидации значений
 */
class Validator {
  /**
   * @param {ValidationOptions} [options] - Опции валидации
   */
  constructor(options = {}) {
    this.rules = [];
    this.errors = [];
    this.options = {
      messages: {},
      context: '',
      ...options,
    };
  }
  /**
   * Создает новый экземпляр валидатора
   * @param {ValidationOptions} [options] - Опции валидации
   * @returns {Validator}
   */
  static schema(options) {
    return new Validator(options);
  }
  /**
   * Проверяет, что значение является строкой
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  string(message) {
    this.rules.push({
      type: 'string',
      check: value => typeof value === 'string',
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является числом
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  number(message) {
    this.rules.push({
      type: 'number',
      check: value => {
        if (typeof value === 'string' && value.trim() !== '') {
          if (!/^-?\d+$/.test(value.trim())) return false; // Проверяем, является ли строка целым числом
          value = Number(value);
        }
        return Number.isInteger(value);
      },
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является целым числом (integer)
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  integer(message) {
    this.rules.push({
      type: 'integer',
      check: value => {
        if (typeof value === 'string' && value.trim() !== '' && /^-?\d+$/.test(value.trim())) {
          value = Number(value);
        }
        return Number.isInteger(value);
      },
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является булевым
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  boolean(message) {
    this.rules.push({
      type: 'boolean',
      check: value => typeof value === 'boolean',
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является массивом
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  array(message) {
    this.rules.push({
      type: 'array',
      check: value => Array.isArray(value),
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является объектом Date или строкой в ISO-формате
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  date(message) {
    this.rules.push({
      type: 'date',
      check: value => {
        const dateObj = value instanceof Date ? value : new Date(value);
        return dateObj instanceof Date && !isNaN(dateObj.getTime());
      },
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение не пустое
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  required(message) {
    this.rules.push({
      type: 'required',
      check: value => {
        if (value === undefined || value === null || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
      },
      message,
    });
    return this;
  }
  /**
   * Проверяет минимальное значение или длину
   * @param {number|Date} limit - Минимальное значение
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  min(limit, message) {
    this.rules.push({
      type: 'min',
      check: value => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string' && value.trim() !== '' && /^-?\d+$/.test(value.trim())) {
          value = Number(value);
        }
        if (typeof value === 'number') return value >= limit;
        if (value?.length !== undefined) return value.length >= limit;
        if (value instanceof Date && limit instanceof Date) {
          return value.getTime() >= limit.getTime();
        }
        return true;
      },
      param: limit,
      message,
    });
    return this;
  }
  max(limit, message) {
    this.rules.push({
      type: 'max',
      check: value => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string' && value.trim() !== '' && /^-?\d+$/.test(value.trim())) {
          value = Number(value);
        }
        if (typeof value === 'number') return value <= limit;
        if (value?.length !== undefined) return value.length <= limit;
        if (value instanceof Date && limit instanceof Date) {
          return value.getTime() <= limit.getTime();
        }
        return true;
      },
      param: limit,
      message,
    });
    return this;
  }
  /**
   * Проверяет соответствие регулярному выражению
   * @param {RegExp} regex - Регулярное выражение
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  pattern(regex, message) {
    // Защита от ReDoS - ограничение сложности регулярного выражения
    if (regex.toString().length > 1000) {
      throw new Error('Regular expression is too complex');
    }
    this.rules.push({
      type: 'pattern',
      check: value => typeof value === 'string' && regex.test(value),
      param: regex,
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение является email-адресом
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  email(message) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.rules.push({
      type: 'email',
      check: value => typeof value === 'string' && emailRegex.test(value),
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение входит в список допустимых
   * @param {any[]} values - Массив допустимых значений
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  oneOf(values, message) {
    this.rules.push({
      type: 'oneOf',
      check: value =>
        values.some(
          item =>
            // Использование глубокого сравнения для объектов
            JSON.stringify(item) === JSON.stringify(value)
        ),
      param: values,
      message,
    });
    return this;
  }
  /**
   * Проверяет, что значение соответствует одному из указанных типов через уже существующие правила валидатора
   * @param {string[]} types - Массив допустимых типов (например: ['string', 'number', 'null', 'array'])
   * @param {string} [message] - Сообщение об ошибке
   * @returns {Validator}
   */
  oneOfTypes(types, message) {
    const validators = types.map(type => {
      const schema = Validator.schema();
      if (type === 'string') return schema.string();
      if (type === 'number') return schema.number();
      if (type === 'integer') return schema.integer();
      if (type === 'boolean') return schema.boolean();
      if (type === 'array') return schema.array();
      if (type === 'object') return schema.object({});
      if (type === 'date') return schema.date();
      if (type === 'null') {
        // Кастомный валидатор для null
        return Validator.schema().custom(val => val === null, 'Значение должно быть null');
      }
      throw new Error(`Unsupported type in oneOfTypes: ${type}`);
    });
    this.rules.push({
      type: 'oneOfTypes',
      check: value => {
        return validators.some(validator => validator.validate(value).isValid);
      },
      param: types,
      message,
    });
    return this;
  }
  /**
   * Добавляет пользовательскую проверку
   * @param {function} fn - Функция проверки
   * @param {string} [errorMessage='Custom validation failed'] - Сообщение об ошибке
   * @returns {Validator}
   */
  custom(fn, errorMessage = 'Custom validation failed') {
    this.rules.push({
      type: 'custom',
      check: fn,
      param: errorMessage,
    });
    return this;
  }
  /**
   * Добавляет валидацию для элементов массива
   * @param {Validator} validator - Валидатор для элементов массива
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  items(validator, message) {
    if (!(validator instanceof Validator)) {
      throw new TypeError('items() expects a Validator instance');
    }
    this.rules.push({
      type: 'items',
      check: value => {
        if (!Array.isArray(value)) return true;
        for (let i = 0; i < value.length; i++) {
          const result = validator.validate(value[i]);
          if (!result.isValid) {
            this.errors.push(`Item at index ${i}: ${result.errors.join(', ')}`);
            return false;
          }
        }
        return true;
      },
      message,
    });
    return this;
  }
  object(schema, message) {
    if (typeof schema !== 'object' || Array.isArray(schema)) {
      throw new TypeError('object() expects a schema object');
    }
    this.rules.push({
      type: 'object',
      check: value => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return false;
        }
        for (const [key, validator] of Object.entries(schema)) {
          if (!(validator instanceof Validator)) {
            throw new TypeError(`Property "${key}" must be a Validator instance`);
          }
          const result = validator.validate(value[key]);
          if (!result.isValid) {
            this.errors.push(`Property "${key}": ${result.errors.join(', ')}`);
            return false;
          }
        }
        return true;
      },
      message,
    });
    return this;
  }
  /**
   * Добавляет валидацию для свойств объекта
   * @param {Object<string, Validator>} schema - Схема объекта
   * @param {string} [message] - Пользовательское сообщение об ошибке
   * @returns {Validator}
   */
  shape(schema, message) {
    this.rules.push({
      type: 'shape',
      check: value => {
        if (typeof value !== 'object' || value === null) return true;
        for (const [key, validator] of Object.entries(schema)) {
          if (!(validator instanceof Validator)) {
            throw new TypeError(`Property "${key}" must have a Validator instance`);
          }
          const result = validator.validate(value[key]);
          if (!result.isValid) {
            this.errors.push(`Property "${key}": ${result.errors.join(', ')}`);
            return false;
          }
        }
        return true;
      },
      message,
    });
    return this;
  }
  /**
   * Получает сообщение об ошибке для правила
   * @param {Rule} rule - Правило
   * @returns {string} - Сообщение об ошибке
   * @private
   */
  _getErrorMessage(rule) {
    // Приоритет: сообщение в правиле > пользовательские сообщения > стандартные сообщения
    if (rule.message) return rule.message;
    // Проверка наличия пользовательского сообщения
    if (this.options.messages[rule.type]) {
      const message = this.options.messages[rule.type];
      if (typeof message === 'function') {
        return message(rule.param);
      }
      return message;
    }
    // Стандартные сообщения
    const context = this.options.context ? `${this.options.context} ` : '';
    switch (rule.type) {
      case 'string':
        return `${context}должно быть строкой`;
      case 'number':
        return `${context}должно быть числом`;
      case 'integer':
        return `${context}должно быть целым числом`;
      case 'boolean':
        return `${context}должно быть логическим значением`;
      case 'array':
        return `${context}должно быть массивом`;
      case 'date':
        return `${context}должно быть корректной датой`;
      case 'required':
        return `${context}обязательное поле`;
      case 'min':
        if (rule.param instanceof Date) return `${context}должно быть не ранее ${rule.param.toLocaleDateString()}`;
        return `${context}должно быть не менее ${rule.param}`;
      case 'max':
        if (rule.param instanceof Date) return `${context}должно быть не позднее ${rule.param.toLocaleDateString()}`;
        return `${context}должно быть не более ${rule.param}`;
      case 'pattern':
        return `${context}не соответствует требуемому формату`;
      case 'email':
        return `${context}должно быть корректным email-адресом`;
      case 'oneOf':
        return `${context}должно быть одним из: ${rule.param.join(', ')}`;
      case 'oneOfTypes':
        return `${context}должно быть одного из типов: ${rule.param.join(', ')}`;
      case 'custom':
        return rule.param;
      case 'items':
        return `${context}содержит невалидные элементы`;
      case 'object':
        return `${context}не соответствует типу объекта`;
      case 'shape':
        return `${context}содержит невалидные свойства`;
      default:
        return 'Ошибка валидации';
    }
  }
  /**
   * Выполняет валидацию значения
   * @param {any} value - Значение для валидации
   * @returns {ValidationResult} - Результат валидации
   */
  validate(value) {
    this.errors = [];
    for (const rule of this.rules) {
      if (!rule.check(value)) {
        // Для правил с вложенной валидацией ошибки уже добавлены
        if (rule.type !== 'items' && rule.type !== 'shape') {
          this.errors.push(this._getErrorMessage(rule));
        }
        // Для типов, где проверка типа важна, прерываем валидацию
        if (['string', 'number', 'object', 'integer', 'boolean', 'array', 'date'].includes(rule.type)) {
          break;
        }
      }
    }
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
    };
  }
}
export default Validator;
