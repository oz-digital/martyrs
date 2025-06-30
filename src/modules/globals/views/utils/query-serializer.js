// @martyrs/src/modules/globals/views/utils/query-serializer.js

/**
 * Сериализует параметры в query string как axios
 * Поддерживает: строки, числа, булевы, даты, массивы, вложенные объекты
 */

/**
 * Кодирует значение для URL
 * @param {*} val - значение для кодирования
 * @returns {string}
 */
function encode(val) {
  return encodeURIComponent(val)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

/**
 * Проверяет, является ли значение датой
 * @param {*} val
 * @returns {boolean}
 */
function isDate(val) {
  return Object.prototype.toString.call(val) === '[object Date]';
}

/**
 * Проверяет, является ли значение объектом
 * @param {*} val
 * @returns {boolean}
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Проверяет, является ли значение URLSearchParams
 * @param {*} val
 * @returns {boolean}
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Сериализует массив
 * @param {string} key
 * @param {Array} arr
 * @returns {Array<string>}
 */
function serializeArray(key, arr) {
  const result = [];
  arr.forEach((val, index) => {
    if (val === null || typeof val === 'undefined') {
      return;
    }
    
    // Для массивов используем формат key[]=value (как в axios)
    const k = key + '[]';
    
    if (isDate(val)) {
      result.push(encode(k) + '=' + encode(val.toISOString()));
    } else if (isObject(val)) {
      // Для объектов в массиве используем индексы
      const nestedParams = serializeObject(val, `${key}[${index}]`);
      result.push(...nestedParams);
    } else {
      result.push(encode(k) + '=' + encode(val));
    }
  });
  return result;
}

/**
 * Сериализует объект
 * @param {Object} obj
 * @param {string} [prefix]
 * @returns {Array<string>}
 */
function serializeObject(obj, prefix) {
  const result = [];
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (value === null || typeof value === 'undefined') {
        continue;
      }
      
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      
      if (isDate(value)) {
        result.push(encode(fullKey) + '=' + encode(value.toISOString()));
      } else if (Array.isArray(value)) {
        result.push(...serializeArray(fullKey, value));
      } else if (isObject(value)) {
        result.push(...serializeObject(value, fullKey));
      } else {
        result.push(encode(fullKey) + '=' + encode(value));
      }
    }
  }
  
  return result;
}

/**
 * Основная функция сериализации параметров
 * @param {Object|URLSearchParams} params
 * @returns {string}
 */
export function serializeParams(params) {
  if (!params) {
    return '';
  }
  
  if (isURLSearchParams(params)) {
    return params.toString();
  }
  
  const parts = [];
  
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const val = params[key];
      
      if (val === null || typeof val === 'undefined') {
        continue;
      }
      
      let serializedVal;
      
      if (Array.isArray(val)) {
        serializedVal = serializeArray(key, val);
      } else if (isDate(val)) {
        serializedVal = [encode(key) + '=' + encode(val.toISOString())];
      } else if (isObject(val)) {
        serializedVal = serializeObject(val, key);
      } else {
        serializedVal = [encode(key) + '=' + encode(val)];
      }
      
      parts.push(...serializedVal);
    }
  }
  
  return parts.join('&');
}

/**
 * Строит полный URL с параметрами
 * @param {string} url
 * @param {Object} params
 * @returns {string}
 */
export function buildURL(url, params) {
  if (!params) {
    return url;
  }
  
  const serializedParams = serializeParams(params);
  if (serializedParams) {
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      url = url.slice(0, hashIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }
  
  return url;
}

export default {
  serializeParams,
  buildURL
};