import NodeCache from 'node-cache';

class Cache {
  constructor(options = {}) {
    const { ttlSeconds = 60 * 5 } = options;
    this.cache = new NodeCache({ stdTTL: ttlSeconds });
    this.tagStore = new Map();
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value) {
    return this.cache.set(key, value);
  }

  async setWithTags(key, value, tags = []) {
    const success = this.cache.set(key, value);
    if (success && tags.length > 0) {
      for (const tag of tags) {
        if (!this.tagStore.has(tag)) {
          this.tagStore.set(tag, new Set());
        }
        this.tagStore.get(tag).add(key);
      }
    }
    return success;
  }

  async del(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const deletedCount = this.cache.del(keyArray);
    for (const key of keyArray) {
      for (const [tag, keySet] of this.tagStore.entries()) {
        if (keySet.has(key)) {
          keySet.delete(key);
          if (keySet.size === 0) {
            this.tagStore.delete(tag);
          }
        }
      }
    }
    return deletedCount;
  }

  async delByTag(tag) {
    if (!this.tagStore.has(tag)) return 0;
    const keys = Array.from(this.tagStore.get(tag));
    const deletedCount = await this.del(keys);
    this.tagStore.delete(tag);
    return deletedCount;
  }

  async delByTags(tags) {
    let totalDeleted = 0;
    for (const tag of tags) {
      totalDeleted += await this.delByTag(tag);
    }
    return totalDeleted;
  }

  async flush() {
    this.cache.flushAll();
    this.tagStore.clear();
  }

  async keys() {
    return this.cache.keys();
  }

  async getTagsForKey(key) {
    const tags = [];
    for (const [tag, keySet] of this.tagStore.entries()) {
      if (keySet.has(key)) {
        tags.push(tag);
      }
    }
    return tags;
  }

  async stats() {
    return {
      keys: this.cache.keys().length,
      tags: this.tagStore.size,
      ...this.cache.getStats(),
    };
  }
}

// Хранилище экземпляров по namespace
const instances = new Map();

// Экспортируем конструктор с поддержкой namespace
export default class CacheNamespaced {
  constructor(namespaceOrOptions, options) {
    let namespace = 'global';
    let cacheOptions = {};

    // Определяем, что передали - namespace или options
    if (typeof namespaceOrOptions === 'string') {
      namespace = namespaceOrOptions;
      cacheOptions = options || {};
    } else if (typeof namespaceOrOptions === 'object') {
      cacheOptions = namespaceOrOptions || {};
    }

    // Если экземпляр для namespace уже существует, возвращаем его
    if (instances.has(namespace)) {
      return instances.get(namespace);
    }

    // Создаем новый экземпляр для namespace
    const instance = new Cache(cacheOptions);
    instances.set(namespace, instance);
    
    return instance;
  }

  // Статический метод для получения всех namespace'ов
  static getNamespaces() {
    return Array.from(instances.keys());
  }

  // Статический метод для очистки конкретного namespace
  static async flushNamespace(namespace) {
    if (instances.has(namespace)) {
      await instances.get(namespace).flush();
    }
  }

  // Статический метод для удаления namespace (полностью)
  static removeNamespace(namespace) {
    if (instances.has(namespace)) {
      instances.get(namespace).flush();
      instances.delete(namespace);
    }
  }
}