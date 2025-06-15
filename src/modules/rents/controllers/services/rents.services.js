import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';
import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
// Validation configs
const queryValidatorConfig = {
  // status: { rule: 'optional', validator: Validator.schema().string().oneOf(['published', 'pending']), default: 'pending' },
  owner: { rule: 'optional', validator: Validator.schema().string(), default: null },
  order: { rule: 'optional', validator: Validator.schema().string(), default: null },
  dateStart: { rule: 'optional', validator: Validator.schema().date(), default: null },
  dateEnd: { rule: 'optional', validator: Validator.schema().date(), default: null },
  startDate: { rule: 'optional', validator: Validator.schema().date(), default: null },
  endDate: { rule: 'optional', validator: Validator.schema().date(), default: null },
  sortParam: { rule: 'optional', validator: Validator.schema().string(), default: null },
  sortOrder: {
    rule: 'optional',
    validator: Validator.schema().string().oneOf(['asc', 'desc']),
    default: 'asc',
  },
  skip: { rule: 'optional', validator: Validator.schema().number().integer().min(0), default: 0 },
  limit: {
    rule: 'optional',
    validator: Validator.schema().number().integer().min(1).max(100),
    default: 10,
  },
  productId: { rule: 'optional', validator: Validator.schema().string(), default: null },
};
const bodyValidatorConfig = {
  // _id: { rule: 'optional', validator: Validator.schema().string() },
  // order: { rule: 'optional', validator: Validator.schema().string() },
  product: { rule: 'optional', validator: Validator.schema().string().required() },
  // quantity: { rule: 'optional', validator: Validator.schema().number().integer().min(1).required() },
  startDate: { rule: 'optional', validator: Validator.schema().date().required() },
  endDate: { rule: 'optional', validator: Validator.schema().date().required() },
  status: {
    rule: 'optional',
    validator: Validator.schema().string().oneOf(['pending', 'confirmed', 'active', 'completed', 'canceled']),
    default: 'pending',
  },
  creator: {
    rule: 'optional',
    validator: Validator.schema()
      .object({
        type: Validator.schema().string().oneOf(['user', 'organization', 'customer', 'User', 'Organization', 'Customer']).required(),
        target: Validator.schema().string().required(),
      })
      .required(),
  },
  owner: {
    rule: 'optional',
    validator: Validator.schema()
      .object({
        type: Validator.schema().string().oneOf(['organization', 'Organization']).required(),
        target: Validator.schema().string().required(),
      })
      .required(),
  },
  comment: { rule: 'optional', validator: Validator.schema().string(), default: '' },
};
const queryVerifier = new Verifier(queryValidatorConfig);
const bodyVerifier = new Verifier(bodyValidatorConfig);
// Controller
const controller = db => {
  const Rent = db.rent;
  // Initialize logger and cache
  const logger = new Logger(db);
  const cache = new Cache({ ttlSeconds: 300 });
  const cacheMetadata = new Map();
  const invalidateCacheForRent = async (rentId, productId, startDate, endDate) => {
    // 1. Всегда инвалидируем кеш по конкретной аренде и продукту
    const specificTags = [`rent:${rentId}`, `product:${productId}`];
    await cache.delByTags(specificTags);
    // Выходим, если даты не предоставлены
    if (!startDate || !endDate) {
      await logger.info(`Cache invalidated for specific rent:${rentId} and product:${productId}`);
      return;
    }
    // 2. Ищем ключи кешей, которые могут перекрываться с новой арендой
    const keysToInvalidate = [];
    for (const [cacheKey, metadata] of cacheMetadata.entries()) {
      // Проверяем есть ли пересечение диапазонов дат
      if ((!metadata.dateStart || new Date(metadata.dateStart) <= new Date(endDate)) && (!metadata.dateEnd || new Date(metadata.dateEnd) >= new Date(startDate))) {
        keysToInvalidate.push(cacheKey);
      }
    }
    // 3. Инвалидируем найденные ключи
    if (keysToInvalidate.length > 0) {
      for (const key of keysToInvalidate) {
        await cache.del(key);
        cacheMetadata.delete(key);
      }
      await logger.info(`Invalidated ${keysToInvalidate.length} date-related cache entries for rent:${rentId}`);
    }
  };
  const read = async (req, res) => {
    try {
      const validationResult = queryVerifier.verify(req.query, {
        applyDefaults: true,
        removeInvalid: true,
      });
      if (!validationResult.isValid) {
        await logger.info(`Invalid query parameters: ${JSON.stringify(validationResult.verificationErrors)}`);
        return res.status(400).json({
          errorCode: 'INVALID_QUERY_PARAMS',
          message: 'Invalid query parameters.',
          details: validationResult.verificationErrors,
        });
      }
      const verifiedData = validationResult.verifiedData;
      const cacheKey = `rents:${JSON.stringify(verifiedData)}`;
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        await logger.info(`Cache hit for key: ${cacheKey}`);
        return res.status(200).json(cachedResult);
      }
      // Создаем pipeline с использованием utility-функций
      const stages = [
        // Базовые фильтры
        ...queryProcessorGlobals.getBasicOptions(verifiedData),
        // Фильтр по датам
        ...queryProcessorGlobals.getFilterDate(verifiedData.dateStart, verifiedData.dateEnd, {
          start: 'startDate',
          end: 'endDate',
        }),
        // Добавляем lookup продуктов
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: {
            path: '$productDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Добавляем стейджи для creator и owner
        queryProcessorGlobals.getCreatorUserLookupStage(),
        queryProcessorGlobals.getCreatorOrganizationLookupStage(),
        queryProcessorGlobals.getCreatorCustomerLookupStage(),
        queryProcessorGlobals.getOwnerUserLookupStage(),
        queryProcessorGlobals.getOwnerOrganizationLookupStage(),
        queryProcessorGlobals.getAddFieldsCreatorOwnerStage(),
        // Проекция нужных полей
        {
          $project: {
            product: 1,
            productDetails: 1,
            quantity: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            creator: 1,
            owner: 1,
            comment: 1,
          },
        },
        // Удаляем временные свойства
        queryProcessorGlobals.removeTempPropeties(),
        // Сортировка и пагинация
        ...queryProcessorGlobals.getSortingOptions(verifiedData.sortParam, verifiedData.sortOrder),
        ...queryProcessorGlobals.getPaginationOptions(verifiedData.skip, verifiedData.limit),
      ];
      const results = await Rent.aggregate(stages);
      // Добавляем теги для каждой аренды и продукта
      const tags = results.map(rent => [`rent:${rent._id}`, `product:${rent.product}`]).flat();
      // Сохраняем метаданные о дате для последующей инвалидации
      cacheMetadata.set(cacheKey, {
        dateStart: verifiedData.dateStart,
        dateEnd: verifiedData.dateEnd,
        timestamp: Date.now(),
      });
      await cache.setWithTags(cacheKey, results, tags);
      await logger.info(`Rents fetched and cached: ${results.length} items`);
      return res.status(200).json(results);
    } catch (err) {
      console.log(err);
      await logger.error(`Error fetching rents: ${err.message}`);
      const errorCode = err.name === 'MongoError' ? 'DATABASE_ERROR' : 'INTERNAL_SERVER_ERROR';
      return res.status(500).json({ errorCode, message: 'Error occurred.', details: err.message });
    }
  };
  const create = async (req, res) => {
    try {
      const validationResult = bodyVerifier.verify(req.body, {
        applyDefaults: true,
        removeInvalid: false,
      });
      if (!validationResult || !validationResult.isValid) {
        console.log(validationResult);
        await logger.info(`Invalid request body: ${JSON.stringify(validationResult.verificationErrors)}`);
        return res.status(400).json({
          errorCode: 'INVALID_BODY',
          message: 'Invalid request body.',
          details: validationResult.verificationErrors,
        });
      }
      const rent = await Rent.create(validationResult.verifiedData);
      const populatedRent = await Rent.findById(rent._id).populate('product');
      await logger.info(`Rent created: ${rent._id}`);
      // Инвалидируем кеши с перекрывающимися датами
      await invalidateCacheForRent(rent._id, rent.product, rent.startDate, rent.endDate);
      return res.status(201).json(populatedRent);
    } catch (err) {
      console.log(err);
      await logger.error(`Error creating rent: ${err.message}`);
      const errorCode = err.name === 'MongoError' ? 'DATABASE_ERROR' : 'INTERNAL_SERVER_ERROR';
      return res.status(500).json({ errorCode, message: 'Error occurred while creating rent.', details: err.message });
    }
  };
  // Периодическая очистка устаревших метаданных о кеше
  const cleanupCacheMetadata = () => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    for (const [key, metadata] of cacheMetadata.entries()) {
      if (now - metadata.timestamp > maxAge) {
        cacheMetadata.delete(key);
      }
    }
  };
  // Запускаем очистку каждый час
  setInterval(cleanupCacheMetadata, 60 * 60 * 1000);
  const update = async (req, res) => {
    try {
      const validationResult = bodyVerifier.verify(req.body, {
        applyDefaults: false,
        removeInvalid: false,
      });
      if (!validationResult || !validationResult.isValid) {
        await logger.info(`Invalid update body: ${JSON.stringify(validationResult.verificationErrors)}`);
        return res.status(400).json({
          errorCode: 'INVALID_BODY',
          message: 'Invalid request body.',
          details: validationResult.verificationErrors,
        });
      }
      const { _id, ...updateData } = validationResult.verifiedData;
      const updatedRent = await Rent.findOneAndUpdate({ _id }, updateData, { new: true }).populate('product');
      if (!updatedRent) {
        await logger.info(`Rent not found for update: ${_id}`);
        return res.status(404).json({ errorCode: 'RENT_NOT_FOUND', message: 'Rent not found.' });
      }
      await logger.info(`Rent updated: ${_id}`);
      await invalidateCacheForRent(_id, updatedRent.product);
      return res.status(200).json(updatedRent);
    } catch (err) {
      await logger.error(`Error updating rent: ${err.message}`);
      const errorCode = err.name === 'MongoError' ? 'DATABASE_ERROR' : 'INTERNAL_SERVER_ERROR';
      return res.status(500).json({ errorCode, message: 'Error occurred while updating rent.', details: err.message });
    }
  };
  const deleteRent = async (req, res) => {
    try {
      const validationResult = bodyVerifier.verify({ _id: req.body._id }, { applyDefaults: false, removeInvalid: false });
      if (!validationResult || !validationResult.isValid) {
        await logger.info(`Invalid delete body: ${JSON.stringify(validationResult.verificationErrors)}`);
        return res.status(400).json({
          errorCode: 'INVALID_BODY',
          message: 'Invalid request body.',
          details: validationResult.verificationErrors,
        });
      }
      const { _id } = validationResult.verifiedData;
      // Get the rent data before deletion to invalidate cache
      const rentToDelete = await Rent.findById(_id);
      if (!rentToDelete) {
        await logger.info(`Rent not found for deletion: ${_id}`);
        return res.status(404).json({ errorCode: 'RENT_NOT_FOUND', message: 'Rent not found.' });
      }
      const deletedRent = await Rent.findOneAndDelete({ _id }).populate('product');
      await logger.info(`Rent deleted: ${_id}`);
      await invalidateCacheForRent(_id, rentToDelete.product);
      return res.status(200).json(deletedRent);
    } catch (err) {
      await logger.error(`Error deleting rent: ${err.message}`);
      const errorCode = err.name === 'MongoError' ? 'DATABASE_ERROR' : 'INTERNAL_SERVER_ERROR';
      return res.status(500).json({ errorCode, message: 'Error occurred while deleting rent.', details: err.message });
    }
  };
  const getAvailability = async (req, res) => {
    try {
      const validationResult = queryVerifier.verify(req.query, {
        applyDefaults: true,
        removeInvalid: true,
        only: ['productId', 'startDate', 'endDate'],
      });
      if (!validationResult || !validationResult.isValid) {
        await logger.info(`Invalid query parameters: ${JSON.stringify(validationResult.verificationErrors)}`);
        return res.status(400).json({
          errorCode: 'INVALID_QUERY_PARAMS',
          message: 'Invalid query parameters.',
          details: validationResult.verificationErrors,
        });
      }
      const { productId, startDate, endDate } = validationResult.verifiedData;
      if (!productId || !startDate || !endDate) {
        return res.status(400).json({
          errorCode: 'MISSING_REQUIRED_PARAMS',
          message: 'productId, startDate, and endDate are required parameters.',
        });
      }
      const cacheKey = `availability:${productId}:${startDate}:${endDate}`;
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        await logger.info(`Cache hit for availability: ${cacheKey}`);
        return res.status(200).json(cachedResult);
      }
      // Получаем информацию о продукте
      const product = await db.product.findById(productId);
      if (!product) {
        await logger.info(`Product not found: ${productId}`);
        return res.status(404).json({ errorCode: 'PRODUCT_NOT_FOUND', message: 'Product not found.' });
      }
      const totalAvailable = product.quantity || 1;
      // Парсим даты как UTC
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);
      const dateRange = [];
      // Генерируем диапазон дат в UTC
      for (let dt = new Date(start); dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
        dateRange.push(new Date(dt));
      }
      // Ищем активные ренты, пересекающиеся с диапазоном
      const activeRents = await Rent.find({
        product: productId,
        status: { $in: ['pending', 'confirmed', 'active'] },
        $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
      });
      // Вычисляем доступность для каждой даты
      const availabilityByDate = dateRange.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        let rentedQuantity = 0;
        activeRents.forEach(rent => {
          const rentStart = new Date(rent.startDate);
          const rentEnd = new Date(rent.endDate);
          // Проверяем, пересекается ли рента с текущей датой
          if (date >= rentStart && date <= rentEnd) {
            rentedQuantity += rent.quantity;
          }
        });
        const available = Math.max(0, totalAvailable - rentedQuantity);
        return {
          date: dateStr,
          totalQuantity: totalAvailable,
          rentedQuantity,
          availableQuantity: available,
        };
      });
      const result = {
        productId,
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        },
        availability: availabilityByDate,
      };
      await cache.setWithTags(cacheKey, result, [`product:${productId}`]);
      await logger.info(`Availability calculated for product: ${productId}`);
      return res.status(200).json(result);
    } catch (err) {
      await logger.error(`Error checking availability: ${err.message}`);
      const errorCode = err.name === 'MongoError' ? 'DATABASE_ERROR' : 'INTERNAL_SERVER_ERROR';
      return res.status(500).json({
        errorCode,
        message: 'Error occurred while checking availability.',
        details: err.message,
      });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteRent,
    getAvailability,
  };
};
export default controller;
