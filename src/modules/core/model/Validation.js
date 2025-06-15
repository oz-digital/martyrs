// ModelValidator.js
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

class ModelValidator {
  constructor(schema) {
    this.schema = schema;
    this.verifier = new Verifier();
    this._initVerifier();
  }
  
  _initVerifier() {
    const schemaDefinition = this.schema.getDefinition();
    
    for (const [field, config] of Object.entries(schemaDefinition)) {
      let validator;
      
      // Если есть кастомный валидатор, используем его
      if (config.custom) {
        validator = config.custom;
      } else {
        // Иначе создаем базовый валидатор по типу
        validator = this._createBaseValidator(field, config);
      }
      
      // Регистрируем в верификаторе
      this.verifier.updateConfig({
        [field]: {
          rule: 'optional',
          validator,
          default: config.default
        }
      });
    }
  }
  
  _createBaseValidator(field, config) {
    let validator = Validator.schema({ context: field });
    
    // Базовые проверки по типу
    if (config.type === String) {
      validator = validator.string();
    } else if (config.type === Number) {
      validator = validator.number();
    } else if (config.type === Boolean) {
      validator = validator.boolean();
    } else if (config.type === Date) {
      validator = validator.date();
    } else if (config.type === Array) {
      validator = validator.array();
    } else if (config.type === Object) {
      validator = validator.object({});
    }
    
    // Дополнительные ограничения
    if (config.required) {
      validator = validator.required();
    }
    
    if (config.min !== undefined) {
      validator = validator.min(config.min);
    }
    
    if (config.max !== undefined) {
      validator = validator.max(config.max);
    }
    
    if (config.enum) {
      validator = validator.oneOf(config.enum);
    }
    
    if (config.pattern) {
      validator = validator.pattern(config.pattern);
    }
    
    return validator;
  }
  
  // Валидация всех данных
  validate(data) {
    return this.verifier.verify(data);
  }
  
  // Валидация одного поля
  validateField(field, value) {
    const config = this.schema.getFieldDefinition(field);
    
    if (!config) {
      return { isValid: false, errors: [`Unknown field: ${field}`] };
    }
    
    const validator = this.verifier._getConfig()[field].validator;
    return validator.validate(value);
  }
}

export default ModelValidator;