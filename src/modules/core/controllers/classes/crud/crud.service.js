// @martyrs/src/modules/core/controllers/classes/crud/crud.service.js
import coreQuery from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';

/**
 * CRUDService - чистая бизнес-логика CRUD операций
 * Не знает про req/res, принимает данные и контекст
 */
export default class CRUDService {
  constructor(crud) {
    this.crud = crud;
    this.customHandlers = new Map();
  }

  // Регистрация кастомного handler
  registerCustomHandler(name, handler) {
    this.customHandlers.set(name, handler);
  }

  // CREATE операция
  async create(data, context = {}) {
    try {
      // Выполнение before хука
      const hookData = await this.crud.core.executeHook('beforeCreate', data, context);
      const finalData = hookData || data;
      
      // Создание документа
      const created = await this.crud.model.create(finalData);
      
      // Очистка кеша
      if (this.crud.core.isCacheEnabled()) {
        await this.invalidateCache('create', created);
      }
      
      // События
      if (this.crud.core.isEventsEnabled()) {
        await this.crud.events.emit('created', {
          document: created,
          user: context.userId
        });
      }
      
      // Выполнение after хука
      await this.crud.core.executeHook('afterCreate', created, context);
      
      return created;
    } catch (error) {
      console.log(error)
      await this.crud.events.logError('create', error);
      throw error;
    }
  }

  // READ операция
  async read(query = {}, context = {}) {
    try {
      // Выполнение before хука
      await this.crud.core.executeHook('beforeRead', query, context);
      
      // Проверка кеша
      let data = null;
      let cacheKey = null;
      
      if (this.crud.core.isCacheEnabled()) {
        cacheKey = this.generateCacheKey('read', query);
        data = await this.crud.cache.get(cacheKey);
      }
      
      if (!data) {
        // Построение aggregation pipeline
        const pipeline = await this.buildAggregationPipeline(query, context);
        
        // Выполнение запроса
        data = await this.crud.model.aggregate(pipeline).exec();
        
        // Сохранение в кеш
        if (this.crud.core.isCacheEnabled() && cacheKey) {
          const cacheOptions = this.crud.core.getCacheOptions();
          await this.crud.cache.setWithTags(
            cacheKey, 
            data, 
            [...cacheOptions.tags, `${this.crud.modelName}_list`],
            cacheOptions.ttl
          );
        }
      }
      
      // События
      if (this.crud.core.isEventsEnabled()) {
        await this.crud.events.emitRead(query, data, context.userId);
      }
      
      // Выполнение after хука
      const hookResult = await this.crud.core.executeHook('afterRead', data, context);
      
      return hookResult || data;
    } catch (error) {
      console.log(error)
      await this.crud.events.logError('read', error);
      throw error;
    }
  }

  // UPDATE операция
  async update(id, updateData, context = {}) {
    try {
      // Загрузка текущего документа
      const current = await this.crud.model.findById(id);
      if (!current) {
        const error = new Error('NOT_FOUND');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      
      // Выполнение before хука
      const hookData = await this.crud.core.executeHook('beforeUpdate', updateData, context, current);
      const finalData = hookData || updateData;
      
      // Обновление документа
      const updated = await this.crud.model.findByIdAndUpdate(
        id,
        finalData,
        { new: true, runValidators: true }
      );
      
      // Очистка кеша
      if (this.crud.core.isCacheEnabled()) {
        await this.invalidateCache('update', updated);
      }
      
      // События
      if (this.crud.core.isEventsEnabled()) {
        await this.crud.events.emit('updated', {
          document: updated,
          previousDocument: current,
          user: context.userId
        });
      }
      
      // Выполнение after хука
      await this.crud.core.executeHook('afterUpdate', updated, context, current);
      
      return updated;
    } catch (error) {
      await this.crud.events.logError('update', error);
      throw error;
    }
  }

  // DELETE операция
  async delete(id, context = {}) {
    try {
      // Загрузка документа
      const document = await this.crud.model.findById(id);
      if (!document) {
        const error = new Error('NOT_FOUND');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      
      // Выполнение before хука
      await this.crud.core.executeHook('beforeDelete', document, context);
      
      // Удаление документа
      await this.crud.model.findByIdAndDelete(id);
      
      // Очистка кеша
      if (this.crud.core.isCacheEnabled()) {
        await this.invalidateCache('delete', document);
      }
      
      // События
      if (this.crud.core.isEventsEnabled()) {
        await this.crud.events.emit('deleted', {
          document,
          user: context.userId
        });
      }
      
      // Выполнение after хука
      await this.crud.core.executeHook('afterDelete', document, context);
      return document;
    } catch (error) {
      await this.crud.events.logError('delete', error);
      throw error;
    }
  }

  // Получение кастомного handler
  getCustomHandler(name) {
    return this.customHandlers.get(name);
  }

  // Построение aggregation pipeline
  async buildAggregationPipeline(query, context) {
    const stages = [];
    const extensions = this.crud.core.getAggregateExtensions();
    
    // Before extension
    if (extensions.before) {
      stages.push(...await extensions.before(query, context));
    }
    
    // Базовые стадии из coreQuery
    stages.push(...coreQuery.getBasicOptions(query));

    // Middle extension
    if (extensions.middle) {
      stages.push(...await extensions.middle(query, context));
    }

    // Lookup стадии
    stages.push(
      coreQuery.getCreatorUserLookupStage(),
      coreQuery.getCreatorOrganizationLookupStage(),
      coreQuery.getOwnerUserLookupStage(),
      coreQuery.getOwnerOrganizationLookupStage(),
      coreQuery.getAddFieldsCreatorOwnerStage()
    );

    // Before pagination extension
    if (extensions.beforePagination) {
      stages.push(...await extensions.beforePagination(query, context));
    }

    // Пагинация и сортировка
    stages.push(
      ...coreQuery.getSortingOptions(query.sortParam, query.sortOrder),
      ...coreQuery.getPaginationOptions(query.skip, query.limit),
      coreQuery.removeTempPropeties()
    );
    
    // After extension
    if (extensions.after) {
      stages.push(...await extensions.after(query, context));
    }
    
    return stages;
  }

  // Управление кешем
  generateCacheKey(operation, data) {
    const prefix = `${this.crud.modelName}:${operation}`;
    
    if (operation === 'read') {
      return `${prefix}:${JSON.stringify(this._normalizeQuery(data))}`;
    }
    
    return `${prefix}:${Date.now()}`;
  }

  _normalizeQuery(query) {
    const normalized = {};
    const keys = Object.keys(query).sort();
    
    for (const key of keys) {
      if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
        normalized[key] = query[key];
      }
    }
    
    return normalized;
  }

  async invalidateCache(operation, document) {
    const cacheOptions = this.crud.core.getCacheOptions();
    const tags = [...cacheOptions.tags];
    
    // Инвалидируем списки при изменениях
    if (['create', 'update', 'delete'].includes(operation)) {
      tags.push(`${this.crud.modelName}_list`);
      
      // Инвалидируем конкретный документ
      if (document && document._id) {
        tags.push(`${this.crud.modelName}_${document._id}`);
      }
    }
    
    for (const tag of tags) {
      await this.crud.cache.delByTags([tag]);
    }
  }
}