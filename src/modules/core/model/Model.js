// Model.js
import ModelSchema from './ModelSchema.js';
import ModelValidator from './ModelValidator.js';

class Model {
  constructor(db, name, schema) {
    this.name = name;
    this._schema = new ModelSchema(schema);
    this._validator = new ModelValidator(this._schema);
    
    if (db.type === 'mongodb') {
      this.adapter = new MongoDBAdapter(name, db);
    } else if (db.type === 'postgresql') {
      this.adapter = new PostgreSQLAdapter(name, db);
    } else {
      // По умолчанию MongoDB
      this.adapter = new MongoDBAdapter(name, db);
    }
  
  // CRUD операции, делегируемые адаптеру
  async create(data) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    const validationResult = this.validate(data);
    if (!validationResult.isValid) {
      throw new Error('Validation failed: ' + JSON.stringify(validationResult.errors));
    }
    
    return await this._adapter.create(data);
  }
  
  async find(query = {}) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    return await this._adapter.find(query);
  }
  
  async findOne(query = {}) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    return await this._adapter.findOne(query);
  }
  
  async findById(id) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    return await this._adapter.findById(id);
  }
  
  async update(id, data) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    const validationResult = this.validate(data);
    
    if (!validationResult.isValid) {
      throw new Error('Validation failed: ' + JSON.stringify(validationResult.errors));
    }
    
    return await this._adapter.update(id, data);
  }
  
  async delete(id) {
    if (!this._adapter) {
      throw new Error('DB adapter not set');
    }
    
    return await this._adapter.delete(id);
  }
  
  // Методы валидации
  validate(data) {
    return this._validator.validate(data);
  }
  
  validateField(field, value) {
    return this._validator.validateField(field, value);
  }
  
  // Методы для доступа к схеме
  getSchema() {
    return this._schema.getDefinition();
  }
  
  createEmpty() {
    return this._schema.createEmpty();
  }
}

export default Model;