// ModelSchema.js
class ModelSchema {
  constructor(schemaDefinition) {
    this.definition = this._normalizeSchema(schemaDefinition);
  }
  
  // Нормализация схемы, чтобы все поля имели одинаковую структуру
  _normalizeSchema(schema) {
    const normalized = {};
    
    for (const [field, config] of Object.entries(schema)) {
      normalized[field] = {
        type: config.type || String,
        required: !!config.required,
        default: config.default,
        custom: config.custom || null,
        // Остальные поля из конфигурации
        ...config
      };
    }
    
    return normalized;
  }
  
  getFieldNames() {
    return Object.keys(this.definition);
  }
  
  getFieldDefinition(field) {
    return this.definition[field];
  }
  
  getDefinition() {
    return this.definition;
  }
  
  // Создание пустого объекта с дефолтными значениями
  createEmpty() {
    const result = {};
    
    for (const [field, config] of Object.entries(this.definition)) {
      if (config.default !== undefined) {
        // Если default - функция, вызываем её
        if (typeof config.default === 'function') {
          result[field] = config.default();
        } else {
          result[field] = config.default;
        }
      } else if (config.type === String) {
        result[field] = '';
      } else if (config.type === Number) {
        result[field] = 0;
      } else if (config.type === Boolean) {
        result[field] = false;
      } else if (config.type === Date) {
        result[field] = new Date();
      } else if (config.type === Array) {
        result[field] = [];
      } else if (config.type === Object) {
        result[field] = {};
      } else {
        result[field] = null;
      }
    }
    
    return result;
  }
}

export default ModelSchema;