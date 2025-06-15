// PostgreSQLAdapter.js
import DBAdapter from './DBAdapter.js';

class PostgreSQLAdapter extends DBAdapter {
  constructor(modelName, connection) {
    super(modelName);
    this.pool = connection;
  }
  
  async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = fields.map(field => data[field]);
    
    const query = `
      INSERT INTO ${this.modelName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  async findById(id) {
    const query = `
      SELECT * FROM ${this.modelName}
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }
  
  async find(query = {}) {
    // Преобразование объекта запроса в WHERE условия
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(query)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    const sqlQuery = `
      SELECT * FROM ${this.modelName}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
    `;
    
    const result = await this.pool.query(sqlQuery, values);
    return result.rows;
  }
  
  async findOne(query = {}) {
    // Преобразование объекта запроса в WHERE условия
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(query)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    const sqlQuery = `
      SELECT * FROM ${this.modelName}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      LIMIT 1
    `;
    
    const result = await this.pool.query(sqlQuery, values);
    return result.rows[0];
  }
  
  async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => data[field])];
    
    const query = `
      UPDATE ${this.modelName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
  
  async delete(id) {
    const query = `
      DELETE FROM ${this.modelName}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }
  
  async count(query = {}) {
    // Преобразование объекта запроса в WHERE условия
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(query)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    const sqlQuery = `
      SELECT COUNT(*) FROM ${this.modelName}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
    `;
    
    const result = await this.pool.query(sqlQuery, values);
    return parseInt(result.rows[0].count);
  }
}

export default PostgreSQLAdapter;