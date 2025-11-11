import { Types } from 'mongoose';
import * as googleMapsServicesJs from '@googlemaps/google-maps-services-js';

const ObjectId = Types.ObjectId;
const { Client } = googleMapsServicesJs;
const client = new Client({});

/**
 * Get basic match conditions for spots (delivery, payment)
 */
const getBasicMatchConditions = query => {
  const conditions = [];

  if (query.delivery) {
    // Нормализуем в массив и фильтруем пустые значения
    let deliveryMethods = Array.isArray(query.delivery)
      ? query.delivery
      : typeof query.delivery === 'string'
      ? query.delivery.split(',')
      : [];

    deliveryMethods = deliveryMethods.filter(Boolean).map(m => m.trim());

    if (deliveryMethods.length > 0) {
      // $in = spots которые поддерживают ХОТЯ БЫ ОДИН метод
      conditions.push({ delivery: { $in: deliveryMethods } });
    }
  }

  if (query.payment) {
    // Нормализуем в массив и фильтруем пустые значения
    let paymentMethods = Array.isArray(query.payment)
      ? query.payment
      : typeof query.payment === 'string'
      ? query.payment.split(',')
      : [];

    paymentMethods = paymentMethods.filter(Boolean).map(m => m.trim());

    if (paymentMethods.length > 0) {
      // $in = spots которые поддерживают ХОТЯ БЫ ОДИН метод
      conditions.push({ payment: { $in: paymentMethods } });
    }
  }

  return conditions;
};

/**
 * Get price filter conditions for variants
 */
const getPriceConditions = (priceMin, priceMax) => {
  if (!priceMin && !priceMax) return [];

  const conditions = {};

  if (priceMin !== undefined && priceMin !== null && priceMin !== '') {
    conditions['products.variants.price'] = { $gte: parseFloat(priceMin) };
  }

  if (priceMax !== undefined && priceMax !== null && priceMax !== '') {
    if (conditions['products.variants.price']) {
      conditions['products.variants.price'].$lte = parseFloat(priceMax);
    } else {
      conditions['products.variants.price'] = { $lte: parseFloat(priceMax) };
    }
  }

  return Object.keys(conditions).length > 0 ? [{ $match: conditions }] : [];
};

/**
 * Get category filter conditions for products
 */
const getCategoryConditions = categories => {
  if (!categories || categories.length === 0) return [];

  const categoriesArray = Array.isArray(categories) ? categories : categories.split(',');

  return [
    {
      $match: {
        'products.category': { $in: categoriesArray.map(id => new ObjectId(id)) },
      },
    },
  ];
};

/**
 * Get contain conditions (spots must have availability, products, etc)
 */
const getContainConditions = contain => {
  if (!contain) return [];

  const conditions = contain.map(property => ({
    [property]: { $exists: true, $not: { $size: 0 } },
  }));

  return conditions.length > 0 ? [{ $match: { $and: conditions } }] : [];
};

/**
 * Геофильтрация для Spots (адаптировано из organizations)
 */
const hasLocationParams = query => query.location || query.address || query.city || query.state || query.country;

const resolveLocation = async query => {
  if (query.location) {
    const parsedLocation = typeof query.location === 'string' ? JSON.parse(query.location) : query.location;
    const coordinates = parsedLocation.lng ? [parsedLocation.lng, parsedLocation.lat] : parsedLocation.coordinates;
    return { coordinates: coordinates.map(coord => parseFloat(coord)) };
  }
  const searchString = [query.address, query.city, query.state, query.country].filter(Boolean).join(', ');
  try {
    const geoResponse = await client.geocode({
      params: {
        address: searchString,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    if (!geoResponse.data.results?.length) {
      throw new Error('Unable to geocode the provided location.');
    }
    const { lng, lat } = geoResponse.data.results[0].geometry.location;
    return { coordinates: [lng, lat] };
  } catch (err) {
    throw new Error('Error occurred while geocoding.');
  }
};

const getRadius = query => {
  if (query.locationRadius) return parseFloat(query.locationRadius) / 6378.1;
  if (query.city) return 25 / 6378.1;
  if (query.state) return 50 / 6378.1;
  return null;
};

const getDistanceStages = location => [
  {
    $addFields: {
      distance: {
        $function: {
          body: `function(spotCoords, userCoords, isMiles) {
            function toRad(x) {
              return x * Math.PI / 180;
            }
            var lon1 = spotCoords[0];
            var lat1 = spotCoords[1];
            var lon2 = userCoords[0];
            var lat2 = userCoords[1];
            var R = 6371;
            if (isMiles) R = 3959;
            var x1 = lat2 - lat1;
            var dLat = toRad(x1);
            var x2 = lon2 - lon1;
            var dLon = toRad(x2);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
          }`,
          args: ['$location.coordinates', location.coordinates, false],
          lang: 'js',
        },
      },
    },
  },
];

const getSpotsLocationStages = async query => {
  if (!hasLocationParams(query)) {
    return { stages: [], userLocation: null };
  }
  const location = await resolveLocation(query);
  const radius = getRadius(query);
  const geoStages = radius
    ? [
        {
          $match: {
            'location.coordinates': {
              $geoWithin: {
                $centerSphere: [[location.coordinates[0], location.coordinates[1]], radius],
              },
            },
          },
        },
      ]
    : [];
  return {
    stages: [...geoStages, ...getDistanceStages(location)],
    userLocation: location,
  };
};

export {
  getBasicMatchConditions,
  getPriceConditions,
  getCategoryConditions,
  getContainConditions,
  getSpotsLocationStages,
};

export default {
  getBasicMatchConditions,
  getPriceConditions,
  getCategoryConditions,
  getContainConditions,
  getSpotsLocationStages,
};
