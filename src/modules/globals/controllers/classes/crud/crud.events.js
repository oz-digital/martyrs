// @martyrs/src/modules/globals/controllers/classes/crud/crud.events.js
import Observer from '@martyrs/src/modules/globals/controllers/classes/globals.observer.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';

export default class CRUDEvents {
  constructor(crud) {
    this.crud = crud;
    this.observer = null;
    this.logger = null;
    this.enabled = false;
    this.options = {};
  }

  init(options = {}) {
    this.enabled = options.enabled !== false;
    this.options = options;
    
    if (this.enabled) {
      this.observer = options.observer || new Observer();
      this.logger = options.logger || new Logger(this.crud.db);
    }
  }

  // Отправка события
  async emit(eventName, data) {
    if (!this.enabled || !this.observer) return;
    
    const fullEventName = `${this.crud.modelName}:${eventName}`;
    
    try {
      await this.observer.notify(fullEventName, {
        ...data,
        timestamp: new Date(),
        model: this.crud.modelName
      });
      
      // Логируем событие
      await this.log('info', `Event emitted: ${fullEventName}`, data);
    } catch (error) {
      console.error(`Error emitting event ${fullEventName}:`, error);
    }
  }

  // Подписка на событие
  subscribe(eventName, handler) {
    if (!this.observer) return null;
    
    const fullEventName = `${this.crud.modelName}:${eventName}`;
    return this.observer.subscribe(fullEventName, handler);
  }

  // Отписка от события
  unsubscribe(eventName, handler) {
    if (!this.observer) return;
    
    const fullEventName = `${this.crud.modelName}:${eventName}`;
    this.observer.unsubscribe(fullEventName, handler);
  }

  // Логирование
  async log(level, message, data = {}) {
    if (!this.enabled || !this.logger) return;
    
    try {
      const logData = {
        model: this.crud.modelName,
        ...data
      };
      
      switch (level) {
        case 'info':
          await this.logger.info(message, logData);
          break;
        case 'warning':
          await this.logger.warning(message, logData);
          break;
        case 'error':
          await this.logger.error(message, logData);
          break;
        default:
          await this.logger.info(message, logData);
      }
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  // Логирование ошибок
  async logError(operation, error) {
    await this.log('error', `Error in ${operation} operation`, {
      operation,
      error: error.message,
      stack: error.stack
    });
  }

  // Специализированные методы событий
  
  async emitCreate(document, userId) {
    await this.emit('created', {
      document,
      user: userId,
      action: 'create'
    });
  }

  async emitUpdate(document, previousDocument, userId) {
    await this.emit('updated', {
      document,
      previousDocument,
      user: userId,
      action: 'update',
      changes: this._getChanges(previousDocument, document)
    });
  }

  async emitDelete(document, userId) {
    await this.emit('deleted', {
      document,
      user: userId,
      action: 'delete'
    });
  }

  async emitRead(query, results, userId) {
    // Read события могут быть опциональными из-за частоты
    if (this.options.logReads !== false) {
      await this.emit('read', {
        query,
        resultCount: Array.isArray(results) ? results.length : 1,
        user: userId,
        action: 'read'
      });
    }
  }

  // Вспомогательные методы
  
  _getChanges(oldDoc, newDoc) {
    const changes = {};
    
    if (!oldDoc || !newDoc) return changes;
    
    // Простое сравнение на верхнем уровне
    for (const key in newDoc) {
      if (newDoc.hasOwnProperty(key)) {
        const oldVal = oldDoc[key];
        const newVal = newDoc[key];
        
        // Пропускаем системные поля
        if (['_id', '__v', 'updatedAt'].includes(key)) continue;
        
        // Простое сравнение (можно улучшить для глубоких объектов)
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes[key] = {
            old: oldVal,
            new: newVal
          };
        }
      }
    }
    
    return changes;
  }

  // Аудит действий
  async audit(action, data) {
    if (!this.options.enableAudit) return;
    
    const auditData = {
      action,
      model: this.crud.modelName,
      timestamp: new Date(),
      ...data
    };
    
    await this.emit('audit', auditData);
    await this.log('info', `Audit: ${action}`, auditData);
  }

  // Метрики
  async recordMetric(metric, value = 1) {
    if (!this.options.enableMetrics) return;
    
    await this.emit('metric', {
      metric,
      value,
      model: this.crud.modelName,
      timestamp: new Date()
    });
  }

  // Проверка включены ли события
  isEnabled() {
    return this.enabled;
  }

  // Временное отключение событий
  disable() {
    this.enabled = false;
  }

  // Включение событий
  enable() {
    if (this.observer && this.logger) {
      this.enabled = true;
    }
  }
}
