import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;

function getBasicOptions(query) {
  console.log(query);
  const { _id, url, status, notstatus, type, organization, owner, customer, creator, product } = query;
  const stages = [];
  const conditions = [];
  if (_id) {
    conditions.push({ _id: new ObjectId(_id) });
  }
  if (url) {
    conditions.push({ url: url });
  }
  // Handle status parameter
  if (status) {
    if (Array.isArray(status)) {
      // If status is an array, use $in operator to match any of the specified statuses
      conditions.push({ status: { $in: status } });
    } else {
      // If status is a single value, use regular equality match
      conditions.push({ status: status });
    }
  }
  // Handle notstatus parameter
  if (notstatus) {
    if (Array.isArray(notstatus)) {
      // If notstatus is an array, use $nin operator to exclude all specified statuses
      conditions.push({ status: { $nin: notstatus } });
    } else {
      // If notstatus is a single value, use $ne operator
      conditions.push({ status: { $ne: notstatus } });
    }
  }
  if (type) {
    conditions.push({ type: type });
  }
  if (owner) {
    conditions.push({ 'owner.target': new ObjectId(owner) });
  }
  if (organization) {
    conditions.push({ organization: new ObjectId(organization) });
  }
  if (customer) {
    conditions.push({ 'customer.target': new ObjectId(customer) });
  }
  if (creator) {
    conditions.push({ 'creator.target': new ObjectId(creator) });
  }
  if (product) {
    conditions.push({ 'product': new ObjectId(product) });
  }

  if (conditions.length > 0) {
    stages.push({ $match: { $and: conditions } });
  }
  return stages;
}
function getFilterDate(dateStart, dateEnd, fieldNames = { start: 'createdAt', end: 'createdAt' }) {
  if (!dateStart && !dateEnd) {
    return [];
  }
  const matchStage = { $and: [] };
  if (dateStart && dateStart !== 'null') {
    matchStage.$and.push({ [fieldNames.end || 'endDate']: { $gte: new Date(dateStart) } });
  }
  if (dateEnd && dateEnd !== 'null') {
    matchStage.$and.push({ [fieldNames.start || 'startDate']: { $lte: new Date(dateEnd) } });
  }
  return matchStage.$and.length > 0 ? [{ $match: matchStage }] : [];
}
function createSearchQuery(search, options = {}) {
  if (!search) {
    return {};
  }
  const fields = options.fields || ['name'];
  const allowDotNotation = options.allowDotNotation || false;
  let regexPattern = '';
  if (allowDotNotation) {
    const parts = search.split('.');
    if (parts.length === 2) {
      regexPattern = parts
        .map(function (part) {
          return part.substr(0, part.length - 1) + '.{1}';
        })
        .join('\\.');
    } else {
      regexPattern = search.substr(0, search.length - 1) + '.{1}';
    }
  } else {
    regexPattern = search.substr(0, search.length - 1) + '.{1}';
  }
  if (fields.length === 1) {
    return {
      [fields[0]]: { $regex: regexPattern, $options: 'i' },
    };
  }
  return {
    $or: fields.map(function (field) {
      return {
        [field]: { $regex: regexPattern, $options: 'i' },
      };
    }),
  };
}
function getSearchOptions(search, options) {
  const query = createSearchQuery(search, options);
  if (Object.keys(query).length) {
    return [{ $match: query }];
  }
  return [];
}
function getTagsOptions(tags) {
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    return [{ $match: { tags: { $in: tagsArray } } }];
  } else {
    return [];
  }
}
function getSortingOptions(param = 'createdAt', order = 'desc') {
  let sort = {
    [param]: order === 'desc' ? -1 : 1,
    _id: 1,
  };
  return [{ $sort: sort }];
}
function getPaginationOptions(skip, limit) {
  let pagination = {
    skip: parseInt(skip) || 0,
    limit: parseInt(limit) || 20,
  };
  return [{ $skip: pagination.skip }, { $limit: pagination.limit }];
}
function getCreatorUserLookupStage() {
  return {
    $lookup: {
      from: 'users',
      let: { creatorId: '$creator.target' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$creatorId'] },
          },
        },
        {
          $project: {
            username: 1,
            profile: 1,
            _id: 1,
          },
        },
      ],
      as: 'creatorUser',
    },
  };
}
function getCreatorOrganizationLookupStage() {
  return {
    $lookup: {
      from: 'organizations',
      let: { creatorId: '$creator.target' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$creatorId'] },
          },
        },
        {
          $project: {
            name: 1, // если нужно, можешь оставить только нужные поля
            profile: 1,
            _id: 1,
          },
        },
      ],
      as: 'creatorOrganization',
    },
  };
}
function getCreatorCustomerLookupStage() {
  return {
    $lookup: {
      from: 'customers',
      let: { creatorId: '$creator.target' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['_id', '$$creatorId'] },
          },
        },
        {
          $project: {
            username: 1, // если есть, можно заменить на нужные поля у customer
            profile: 1,
            _id: 1,
          },
        },
      ],
      as: 'creatorCustomer',
    },
  };
}
function getOwnerUserLookupStage() {
  return {
    $lookup: {
      from: 'users',
      let: { ownerId: '$owner.target' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$ownerId'] },
          },
        },
        {
          $project: {
            username: 1,
            profile: 1,
            email: 1,
            phone: 1,
            _id: 1,
          },
        },
      ],
      as: 'ownerUser',
    },
  };
}
function getOwnerOrganizationLookupStage() {
  return {
    $lookup: {
      from: 'organizations',
      let: { ownerId: '$owner.target' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$ownerId'] },
          },
        },
        {
          $project: {
            official: 1, // если нужно
            owner: 1, // если нужно
            profile: 1,
            _id: 1,
          },
        },
      ],
      as: 'ownerOrganization',
    },
  };
}
function getAddFieldsCreatorOwnerStage() {
  return {
    $addFields: {
      'creator.target': {
        $switch: {
          branches: [
            {
              case: { $eq: [{ $toLower: '$creator.type' }, 'user'] },
              then: { $arrayElemAt: ['$creatorUser', 0] },
            },
            {
              case: { $eq: [{ $toLower: '$creator.type' }, 'organization'] },
              then: { $arrayElemAt: ['$creatorOrganization', 0] },
            },
            {
              case: { $eq: [{ $toLower: '$creator.type' }, 'customer'] },
              then: { $arrayElemAt: ['$creatorCustomer', 0] },
            },
          ],
          default: 'Unknown type', // или любое другое значение по умолчанию, которое вы хотите использовать
        },
      },
      'owner.target': {
        $cond: [{ $eq: ['$owner.type', 'user'] }, { $arrayElemAt: ['$ownerUser', 0] }, { $arrayElemAt: ['$ownerOrganization', 0] }],
      },
    },
  };
}


/**
 * Получает запрошенные лукапы из параметров запроса
 * @param {Object} query - параметры запроса
 * @returns {Array} массив запрошенных лукапов
 */
function getRequestedLookups(query) {
  return query.lookup ? (Array.isArray(query.lookup) ? query.lookup : query.lookup.split(',')) : [];
}

/**
 * Генерирует этапы агрегации для запрошенных лукапов
 * @param {Array} requestedLookups - запрошенные лукапы
 * @param {Object} configs - конфигурации лукапов
 * @returns {Array} этапы агрегации
 */
function getLookupStages(requestedLookups, configs) {
  if (!requestedLookups || requestedLookups.length === 0) return [];
  
  return requestedLookups
    .map(lookup => configs[lookup])
    .filter(Boolean)
    .flatMap(config => [
      { $lookup: config.lookup },
      ...(config.additionalStages || [])
    ]);
}

/**
 * Checks if specified lookup is requested
 * @param {String} lookupName - Name of the lookup to check
 * @param {Array} requestedLookups - Array of requested lookups
 * @returns {Boolean} True if lookup is requested
 */
function isLookupRequested(lookupName, requestedLookups) {
  return requestedLookups.includes(lookupName);
};

// @martyrs/src/modules/products/controllers/utils/priceProcessor.js
/**
 * Обрабатывает фильтрацию по ценам
 * @param {string} prices - строка с ценовыми диапазонами
 * @returns {Array} массив этапов агрегации для фильтрации по ценам
 */
function getPriceConditions(prices) {
  if (!prices) return [];
  
  const priceRanges = prices.split(',');
  const priceConditions = priceRanges.map(priceRange => {
    if (priceRange.startsWith('<')) {
      return { price: { $lt: parseInt(priceRange.slice(1)) } };
    }
    if (priceRange.startsWith('>')) {
      return { price: { $gt: parseInt(priceRange.slice(1)) } };
    }
    const [min, max] = priceRange.split('-').map(Number);
    return { price: { $gte: min, $lte: max } };
  });
  
  return priceConditions.length > 0 ? [{ $match: { $or: priceConditions } }] : [];
}



function removeTempPropeties() {
  return {
    $project: {
      creatorOrganization: 0,
      creatorUser: 0,
      ownerOrganization: 0,
      ownerUser: 0,
      creatorCustomer: 0,
      ownerCustomer: 0,
    },
  };
}
export {
  getAddFieldsCreatorOwnerStage,
  getBasicOptions,
  getCreatorCustomerLookupStage,
  getCreatorOrganizationLookupStage,
  getCreatorUserLookupStage,
  getFilterDate,
  getOwnerOrganizationLookupStage,
  getOwnerUserLookupStage,
  getPaginationOptions,
  getSearchOptions,
  getSortingOptions,
  getTagsOptions,
  removeTempPropeties,
  getRequestedLookups,
  getLookupStages,
  getPriceConditions,
};
export default {
  getBasicOptions,
  getSortingOptions,
  getPaginationOptions,
  getTagsOptions,
  getFilterDate,
  getSearchOptions,
  getCreatorUserLookupStage,
  getCreatorOrganizationLookupStage,
  getCreatorCustomerLookupStage,
  getOwnerUserLookupStage,
  getOwnerOrganizationLookupStage,
  getAddFieldsCreatorOwnerStage,
  removeTempPropeties,
  getRequestedLookups,
  getLookupStages,
  getPriceConditions,
};
