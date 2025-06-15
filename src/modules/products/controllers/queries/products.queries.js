// @martyrs/src/modules/products/controllers/utils/filterProcessor.js
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

/**
 * Обрабатывает фильтрацию по категориям
 * @param {string} categories - строка с ID категорий, разделенная запятыми
 * @returns {Array} этапы агрегации для фильтрации по категориям
 */
function getCategoriesFilterStage(categories) {
  if (!categories) return [];
  
  const categoryIds = categories.split(',').filter(Boolean);
  if (categoryIds.length === 0) return [];
  
  return [{
    $match: {
      category: {
        $in: categoryIds.map(id => new ObjectId(id))
      }
    }
  }];
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
  getDeliveryFilterStage
};

export default { 
  getAttributeFiltersStage,
  getCategoriesFilterStage,
  getDeliveryFilterStage 
};