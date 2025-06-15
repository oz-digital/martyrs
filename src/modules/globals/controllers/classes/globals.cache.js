import NodeCache from 'node-cache';
class Cache {
  constructor(options = {}) {
    const { ttlSeconds = 60 * 5 } = options; // По умолчанию 5 минут
    this.cache = new NodeCache({ stdTTL: ttlSeconds });
    this.tagStore = new Map(); // Хранилище тегов: tag -> Set(key)
  }
  /**
   * Получение значения по ключу
   * @param {string} key - Ключ
   * @returns {Promise<any>} Значение из кэша
   */
  async get(key) {
    return this.cache.get(key);
  }
  /**
   * Установка значения по ключу
   * @param {string} key - Ключ
   * @param {any} value - Значение
   * @returns {Promise<boolean>} Успешность операции
   */
  async set(key, value) {
    return this.cache.set(key, value);
  }
  /**
   * Установка значения с тегами
   * @param {string} key - Ключ
   * @param {any} value - Значение
   * @param {string[]} tags - Массив тегов
   * @returns {Promise<boolean>} Успешность операции
   */
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
  /**
   * Удаление по ключу или ключам
   * @param {string|string[]} keys - Ключ или массив ключей
   * @returns {Promise<number>} Количество удаленных элементов
   */
  async del(keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const deletedCount = this.cache.del(keyArray);
    // Обновляем tagStore
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
  /**
   * Удаление всех ключей, связанных с тегом
   * @param {string} tag - Тег
   * @returns {Promise<number>} Количество удаленных элементов
   */
  async delByTag(tag) {
    if (!this.tagStore.has(tag)) return 0;
    const keys = Array.from(this.tagStore.get(tag));
    const deletedCount = await this.del(keys);
    this.tagStore.delete(tag); // Тег больше не нужен
    return deletedCount;
  }
  /**
   * Удаление всех ключей, связанных с массивом тегов
   * @param {string[]} tags - Массив тегов
   * @returns {Promise<number>} Количество удаленных элементов
   */
  async delByTags(tags) {
    let totalDeleted = 0;
    for (const tag of tags) {
      totalDeleted += await this.delByTag(tag);
    }
    return totalDeleted;
  }
  /**
   * Полная очистка кэша
   * @returns {Promise<void>}
   */
  async flush() {
    this.cache.flushAll();
    this.tagStore.clear();
  }
  /**
   * Получение всех ключей в кэше
   * @returns {Promise<string[]>} Массив ключей
   */
  async keys() {
    return this.cache.keys();
  }
  /**
   * Получение тегов для ключа
   * @param {string} key - Ключ
   * @returns {Promise<string[]>} Массив тегов
   */
  async getTagsForKey(key) {
    const tags = [];
    for (const [tag, keySet] of this.tagStore.entries()) {
      if (keySet.has(key)) {
        tags.push(tag);
      }
    }
    return tags;
  }
  /**
   * Получение статистики кэша
   * @returns {Promise<object>} Статистика
   */
  async stats() {
    return {
      keys: this.cache.keys().length,
      tags: this.tagStore.size,
      ...this.cache.getStats(),
    };
  }
}
export default Cache;
