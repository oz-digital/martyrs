// MongoDBAdapter.js
import DBAdapter from './DBAdapter.js';
import { ObjectId } from 'mongodb';

class MongoDBAdapter extends DBAdapter {
  constructor(modelName, connection) {
    super(modelName);
    this.db = connection.db;
  }
  
  // Преобразование строкового ID в ObjectId
  convertId(id) {
    return new ObjectId(id);
  }
  
  async create(data) {
    const collection = this.db.collection(this.modelName);
    const result = await collection.insertOne(data);
    return { ...data, _id: result.insertedId };
  }
  
  async findById(id) {
    const collection = this.db.collection(this.modelName);
    return await collection.findOne({ _id: this.convertId(id) });
  }
  
  async find(query = {}) {
    const collection = this.db.collection(this.modelName);
    return await collection.find(query).toArray();
  }
  
  async findOne(query = {}) {
    const collection = this.db.collection(this.modelName);
    return await collection.findOne(query);
  }
  
  async update(id, data) {
    const collection = this.db.collection(this.modelName);
    const result = await collection.findOneAndUpdate(
      { _id: this.convertId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }
  
  async delete(id) {
    const collection = this.db.collection(this.modelName);
    const result = await collection.deleteOne({ _id: this.convertId(id) });
    return result.deletedCount > 0;
  }
  
  async aggregate(pipeline) {
    const collection = this.db.collection(this.modelName);
    return await collection.aggregate(pipeline).toArray();
  }
  
  async count(query = {}) {
    const collection = this.db.collection(this.modelName);
    return await collection.countDocuments(query);
  }
}

export default MongoDBAdapter;