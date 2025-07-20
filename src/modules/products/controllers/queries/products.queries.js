// @martyrs/src/modules/products/controllers/utils/filterProcessor.js
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

/**
 * Обрабатывает фильтрацию по категориям
 * @param {string|Array} categories - URL категории или массив ID категорий для обратной совместимости
 * @returns {Array} этапы агрегации для фильтрации по категориям
 */
function getCategoriesFilterStage(categories) {
  if (!categories) return [];
  
  // Если передан URL как строка, используем новую логику с materialised path
  if (typeof categories === 'string') {
    return [
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $match: {
          'categoryData.url': {
            $regex: `^${categories}(/|$)`
          }
        }
      },
      {
        $project: {
          categoryData: 0
        }
      }
    ];
  }
  
  // Обратная совместимость: если передан массив ID
  if (Array.isArray(categories)) {
    const categoryIds = categories.filter(Boolean);
    if (categoryIds.length === 0) return [];
    
    return [{
      $match: {
        category: {
          $in: categoryIds.map(id => new ObjectId(id))
        }
      }
    }];
  }
  
  return [];
}

/**
 * Обрабатывает фильтрацию по опциям доставки
 * @param {string} delivery - строка с опциями доставки, разделенная запятыми
 * @returns {Array} этапы агрегации для фильтрации по доставке
 */
function getDeliveryFilterStage(delivery) {
  if (!delivery) return [];
  
  const deliveryOptions = delivery.split(',').filter(Boolean);
  if (deliveryOptions.length === 0) return [];
  
  return [{
    $match: {
      delivery: { $in: deliveryOptions }
    }
  }];
}

/**
 * Обрабатывает сложные фильтры атрибутов
 * @param {string} filtersString - JSON-строка с фильтрами
 * @returns {Array} этапы агрегации для фильтрации по атрибутам
 */
function getAttributeFiltersStage(filtersString) {
  if (!filtersString) return [];
  
  try {
    const filters = JSON.parse(filtersString);
    if (!Array.isArray(filters) || filters.length === 0) return [];
    
    // Массив условий для каждого фильтра
    const filterConditions = [];
    
    filters.forEach(filter => {
      const { parameter, values, caseSensitive = false } = filter;
      if (!values || values.length === 0) return;
      
      const conditions = values.map(value => {
        const valueCondition = caseSensitive 
          ? value 
          : { $regex: `^${escapeRegex(value)}$`, $options: 'i' };
        
        return {
          attributes: {
            $elemMatch: {
              name: parameter,
              value: valueCondition
            }
          }
        };
      });
      
      if (conditions.length > 0) {
        filterConditions.push({ $or: conditions });
      }
    });
    
    // Объединяем все фильтры через $and
    return filterConditions.length > 0 
      ? [{ $match: { $and: filterConditions } }] 
      : [];
  } catch (error) {
    console.error('Error parsing attribute filters:', error);
    return [];
  }
}

/**
 * Обрабатывает фильтрацию по цене вариантов
 * @param {string} priceMin - минимальная цена
 * @param {string} priceMax - максимальная цена
 * @returns {Array} этапы агрегации для фильтрации по ценам вариантов
 */
function getVariantPriceFilterStage(priceMin, priceMax) {
  // Проверяем что хотя бы одно значение существует и не пустое
  const hasValidMin = priceMin && priceMin.trim() !== '';
  const hasValidMax = priceMax && priceMax.trim() !== '';
  
  if (!hasValidMin && !hasValidMax) return [];
  
  try {
    const priceCondition = {
      variants: {
        $elemMatch: {
          price: {}
        }
      }
    };
    
    if (hasValidMin) {
      const minPrice = parseFloat(priceMin);
      if (!isNaN(minPrice)) {
        priceCondition.variants.$elemMatch.price.$gte = minPrice;
      }
    }
    
    if (hasValidMax) {
      const maxPrice = parseFloat(priceMax);
      if (!isNaN(maxPrice)) {
        priceCondition.variants.$elemMatch.price.$lte = maxPrice;
      }
    }
    
    return [{ $match: priceCondition }];
  } catch (error) {
    console.error('Error parsing price filters:', error);
    return [];
  }
}

/**
 * Обрабатывает фильтрацию по доступности с учетом количества
 * @param {string} dateStart - начальная дата
 * @param {string} dateEnd - конечная дата
 * @returns {Array} этапы агрегации для фильтрации по доступности
 */
function getAvailabilityFilterStage(dateStart, dateEnd) {
  if (!dateStart || !dateEnd) return [];
  
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  
  // Проверяем валидность дат
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn('Invalid dates provided for availability filter:', { dateStart, dateEnd });
    return [];
  }
  
  
  return [
    {
      $lookup: {
        from: 'rents',
        let: { 
          productId: '$_id',
          dateStart: startDate,
          dateEnd: endDate
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product', '$$productId'] },
                  { $in: ['$status', ['pending', 'confirmed', 'active']] },
                  {
                    $or: [
                      {
                        $and: [
                          { $gte: ['$startDate', '$$dateStart'] },
                          { $lte: ['$startDate', '$$dateEnd'] }
                        ]
                      },
                      {
                        $and: [
                          { $gte: ['$endDate', '$$dateStart'] },
                          { $lte: ['$endDate', '$$dateEnd'] }
                        ]
                      },
                      {
                        $and: [
                          { $lte: ['$startDate', '$$dateStart'] },
                          { $gte: ['$endDate', '$$dateEnd'] }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              totalRented: { $sum: { $ifNull: ['$available', 1] } }
            }
          }
        ],
        as: 'rentInfo'
      }
    },
    {
      $addFields: {
        rentedQuantity: {
          $ifNull: [{ $arrayElemAt: ['$rentInfo.totalRented', 0] }, 0]
        },
        availableQuantity: {
          $subtract: [
            { $ifNull: ['$available', 0] },
            { $ifNull: [{ $arrayElemAt: ['$rentInfo.totalRented', 0] }, 0] }
          ]
        },
      }
    },
    {
      $match: {
        $or: [
          { availableQuantity: { $gt: 0 } },
          { $and: [{ rentedQuantity: 0 }, { $or: [{ available: { $gt: 0 } }, { available: { $exists: false } }] }] }
        ]
      }
    },
    {
      $project: {
        rentInfo: 0,
        rentedQuantity: 0,
        availableQuantity: 0
      }
    }
  ];
}

/**
 * Экранирует специальные символы в регулярном выражении
 * @private
 * @param {string} string - строка для экранирования
 * @returns {string} экранированная строка
 */
function escapeRegex(string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export { 
  getAttributeFiltersStage,
  getCategoriesFilterStage,
  getDeliveryFilterStage,
  getVariantPriceFilterStage,
  getAvailabilityFilterStage
};

export default { 
  getAttributeFiltersStage,
  getCategoriesFilterStage,
  getDeliveryFilterStage,
  getVariantPriceFilterStage,
  getAvailabilityFilterStage
};