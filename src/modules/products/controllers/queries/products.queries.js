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
 * @param {string} prices - строка с ценовыми диапазонами
 * @returns {Array} этапы агрегации для фильтрации по ценам вариантов
 */
function getVariantPriceFilterStage(prices) {
  if (!prices) return [];
  
  try {
    const priceRanges = prices.split(',');
    const priceConditions = [];
    
    priceRanges.forEach(priceRange => {
      if (priceRange.startsWith('<')) {
        priceConditions.push({
          variants: {
            $elemMatch: {
              price: { $lt: parseFloat(priceRange.slice(1)) }
            }
          }
        });
      } else if (priceRange.startsWith('>')) {
        priceConditions.push({
          variants: {
            $elemMatch: {
              price: { $gt: parseFloat(priceRange.slice(1)) }
            }
          }
        });
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          priceConditions.push({
            variants: {
              $elemMatch: {
                price: { $gte: min, $lte: max }
              }
            }
          });
        }
      }
    });
    
    return priceConditions.length > 0 ? [{ $match: { $or: priceConditions } }] : [];
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
  
  return [
    {
      $lookup: {
        from: 'rents',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product', '$$productId'] },
                  { $in: ['$status', ['confirmed', 'active']] },
                  {
                    $or: [
                      {
                        $and: [
                          { $gte: ['$startDate', startDate] },
                          { $lte: ['$startDate', endDate] }
                        ]
                      },
                      {
                        $and: [
                          { $gte: ['$endDate', startDate] },
                          { $lte: ['$endDate', endDate] }
                        ]
                      },
                      {
                        $and: [
                          { $lte: ['$startDate', startDate] },
                          { $gte: ['$endDate', endDate] }
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
              totalRented: { $sum: { $ifNull: ['$quantity', 1] } }
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
            { $ifNull: ['$quantity', 1] },
            { $ifNull: [{ $arrayElemAt: ['$rentInfo.totalRented', 0] }, 0] }
          ]
        }
      }
    },
    {
      $match: {
        availableQuantity: { $gt: 0 }
      }
    },
    {
      $project: {
        rentInfo: 0,
        rentedQuantity: 0
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