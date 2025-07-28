class Observer {
  constructor() {
    this.listeners = {};
  }

  subscribe(eventType, callback, once = false) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = new Map();
    }
    this.listeners[eventType].set(callback, { once });
  }

  async notify(eventType, data) {
    if (this.listeners[eventType]) {
      const promises = [];
      const callbacksToRemove = [];
      
      for (const [callback, { once }] of this.listeners[eventType]) {
        const promise = Promise.resolve()
          .then(() => callback(data))
          .catch(error => {
            console.error('Error executing callback:', error);
          });
        promises.push(promise);
        
        if (once) {
          callbacksToRemove.push(callback);
        }
      }
      
      await Promise.all(promises);
      
      for (const callback of callbacksToRemove) {
        this.listeners[eventType].delete(callback);
        if (this.listeners[eventType].size === 0) {
          delete this.listeners[eventType];
        }
      }
    }
  }

  remove(eventType, callback) {
    if (this.listeners[eventType]?.has(callback)) {
      this.listeners[eventType].delete(callback);
      if (this.listeners[eventType].size === 0) {
        delete this.listeners[eventType];
      }
    }
  }

  removeAll(eventType) {
    if (eventType) {
      delete this.listeners[eventType];
    } else {
      this.listeners = {};
    }
  }
}

// Хранилище экземпляров по namespace
const instances = new Map();

// Экспортируем конструктор с поддержкой namespace
export default class ObserverNamespaced {
  constructor(namespace = 'global') {
    // Если экземпляр для namespace уже существует, возвращаем его
    if (instances.has(namespace)) {
      return instances.get(namespace);
    }

    // Создаем новый экземпляр для namespace
    const instance = new Observer();
    instances.set(namespace, instance);
    
    return instance;
  }

  // Статический метод для получения всех namespace'ов
  static getNamespaces() {
    return Array.from(instances.keys());
  }

  // Статический метод для очистки подписок в namespace
  static clearNamespace(namespace) {
    if (instances.has(namespace)) {
      instances.get(namespace).removeAll();
    }
  }

  // Статический метод для удаления namespace (полностью)
  static removeNamespace(namespace) {
    if (instances.has(namespace)) {
      instances.get(namespace).removeAll();
      instances.delete(namespace);
    }
  }
}