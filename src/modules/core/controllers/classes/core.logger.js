class Logger {
  constructor(db) {
    this.LogModel = db.log;
  }

  async log(level, message) {
    const logEntry = new this.LogModel({
      level,
      message,
    });
    try {
      await logEntry.save();
      console.info(`Logged: ${level} - ${message}`);
    } catch (err) {
      console.error('Logging error:', err);
    }
  }

  async info(message) {
    await this.log('info', message);
  }

  async error(message) {
    await this.log('error', message);
  }
}

// Хранилище экземпляров по namespace
const instances = new Map();

// Экспортируем конструктор с поддержкой namespace
export default class LoggerNamespaced {
  constructor(namespaceOrDb, db) {
    // Если передали только db (старый способ)
    if (!db && namespaceOrDb && typeof namespaceOrDb === 'object') {
      const namespace = 'global';
      
      if (instances.has(namespace)) {
        return instances.get(namespace);
      }
      
      const instance = new Logger(namespaceOrDb);
      instances.set(namespace, instance);
      return instance;
    }
    
    // Если передали namespace и db
    const namespace = namespaceOrDb;
    
    if (instances.has(namespace)) {
      return instances.get(namespace);
    }
    
    const instance = new Logger(db);
    instances.set(namespace, instance);
    return instance;
  }

  // Статический метод для получения всех namespace'ов
  static getNamespaces() {
    return Array.from(instances.keys());
  }
}