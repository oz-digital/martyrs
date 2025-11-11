import Cache from '@martyrs/src/modules/core/controllers/classes/core.cache.js';
import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import { getLookupStages } from '@martyrs/src/modules/organizations/controllers/utils/queryProcessorOrganizations.js';
import lookupConfigs from './utils/lookupConfigs.js';
import {
  getBasicMatchConditions,
  getPriceConditions,
  getCategoryConditions,
  getContainConditions,
  getSpotsLocationStages,
} from './utils/queryProcessorMarketplace.js';

const controllerFactory = db => {
  const Spot = db.spot;

  const cache = new Cache({ ttlSeconds: 60 * 5 });

  const readCatalog = async (req, res) => {
    console.log('marketplace catalog query', req.query);

    try {
      const cacheKey = JSON.stringify(req.query);

      let cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        return res.status(200).send(cachedResult);
      }

      const matchConditions = getBasicMatchConditions(req.query);

      const stages = [
        // Базовые фильтры spots (delivery, payment)
        ...(matchConditions.length > 0 ? [{ $match: { $and: matchConditions } }] : []),

        // Геопоиск ПЕРВЫМ (если есть location)
        ...(req.query.location || req.query.city || req.query.state || req.query.country
          ? (await getSpotsLocationStages(req.query)).stages
          : [{ $addFields: { distance: null } }]),

        // Lookups (без availability пока)
        ...getLookupStages(['products', 'organizations'], lookupConfigs),

        // Фильтр по наличию products
        ...getContainConditions(['products', 'organizations']),

        // Фильтр по ценам
        ...getPriceConditions(req.query.priceMin, req.query.priceMax),

        // Фильтр по категориям
        ...getCategoryConditions(req.query.categories),

        // Group по organization
        {
          $group: {
            _id: { $arrayElemAt: ['$organizations._id', 0] },
            profile: { $first: { $arrayElemAt: ['$organizations.profile', 0] } },
            rating: { $first: { $arrayElemAt: ['$organizations.rating', 0] } },
            official: { $first: { $arrayElemAt: ['$organizations.official', 0] } },
            views: { $first: { $arrayElemAt: ['$organizations.views', 0] } },
            spots: {
              $push: {
                _id: '$_id',
                name: '$profile.name',
                address: '$address',
                location: '$location',
                distance: '$distance',
                delivery: '$delivery',
                payment: '$payment',
              },
            },
            products: { $first: '$products' },
            distance: { $min: '$distance' },
          },
        },

        // Добавляем numberOfProducts
        {
          $addFields: {
            numberOfProducts: { $size: { $ifNull: ['$products', []] } },
          },
        },

        // Финальная структура
        {
          $project: {
            _id: 1,
            profile: 1,
            rating: 1,
            official: 1,
            views: 1,
            spots: 1,
            products: 1,
            distance: 1,
            numberOfProducts: 1,
          },
        },

        // Сортировка
        ...queryProcessorCore.getSortingOptions(req.query.sortParam || 'distance', req.query.sortOrder),

        // Пагинация
        ...queryProcessorCore.getPaginationOptions(req.query.skip, req.query.limit),
      ].filter(Boolean);

      console.log('Marketplace pipeline:', JSON.stringify(stages, null, 2));

      const catalog = await Spot.aggregate(stages);

      await cache.setWithTags(cacheKey, catalog, ['marketplace_catalog']);

      res.status(200).send(catalog);
    } catch (err) {
      console.error('Marketplace catalog error:', err);
      res.status(500).send({ message: err.message });
    }
  };

  return {
    readCatalog,
  };
};

export default controllerFactory;
