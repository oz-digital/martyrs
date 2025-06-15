// DBAdapter.js
class DBAdapter {
  constructor(modelName) {
    this.modelName = modelName;
  }
  
  async create(data) { throw new Error('Not implemented'); }
  async find(query) { throw new Error('Not implemented'); }
  async findOne(query) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
  async aggregate(pipeline) { throw new Error('Not implemented'); }
  async count(query) { throw new Error('Not implemented'); }
}

export default DBAdapter;