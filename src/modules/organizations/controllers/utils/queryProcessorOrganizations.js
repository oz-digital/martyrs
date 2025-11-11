import * as googleMapsServicesJs from '@googlemaps/google-maps-services-js';
import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
const { Client } = googleMapsServicesJs;
const client = new Client({});
const getRequestedLookups = query => (query.lookup ? (Array.isArray(query.lookup) ? query.lookup : [query.lookup]) : []);
const getLookupStages = (requestedLookups, configs) => {
  if (!requestedLookups) return [];
  const lookupsArray = Array.isArray(requestedLookups) ? requestedLookups : requestedLookups.split(',');
  return lookupsArray
    .map(lookup => configs[lookup])
    .filter(Boolean)
    .flatMap(config => [
      { $lookup: config.lookup }, // Оберните lookup в объект с $lookup
      ...(config.additionalStages || []),
    ]);
};
const getLocationStages = async query => {
  if (!hasLocationParams(query)) {
    return { stages: [], userLocation: null };
  }
  const location = await resolveLocation(query);
  const radius = getRadius(query);
  const geoStages = radius
    ? [
        {
          $match: {
            'spots.location.coordinates': {
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
const getRadius = query => {
  if (query.locationRadius) return parseFloat(query.locationRadius) / 6378.1;
  if (query.city) return 25 / 6378.1;
  if (query.state) return 50 / 6378.1;
  return null;
};
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
const getDistanceStages = location => [
  {
    $addFields: {
      spots: {
        $map: {
          input: '$spots',
          as: 'spot',
          in: {
            $mergeObjects: [
              '$$spot',
              {
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
                    args: ['$$spot.location.coordinates', location.coordinates, false],
                    lang: 'js',
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $addFields: {
      distance: { $min: '$spots.distance' },
      distanceExist: {
        $cond: {
          if: { $eq: [{ $type: '$distance' }, 'double'] },
          then: true,
          else: false,
        },
      },
    },
  },
];
const getPriceConditions = (prices, priceMin, priceMax) => {
  // Если есть priceMin/priceMax, конвертируем в формат "min-max"
  if ((priceMin && priceMin.trim() !== '') || (priceMax && priceMax.trim() !== '')) {
    const min = (priceMin && priceMin.trim() !== '') ? priceMin : '0';
    const max = (priceMax && priceMax.trim() !== '') ? priceMax : '999999';
    prices = `${min}-${max}`;
  }

  if (!prices) return [];
  const priceRanges = prices.split(',');
  const priceConditions = priceRanges.map(priceRange => {
    if (priceRange.startsWith('<')) return { 'products.price': { $lt: parseInt(priceRange.slice(1)) } };
    if (priceRange.startsWith('>')) return { 'products.price': { $gt: parseInt(priceRange.slice(1)) } };
    const [min, max] = priceRange.split('-').map(Number);
    return { 'products.price': { $gte: min, $lte: max } };
  });
  return priceConditions.length > 0 ? [{ $match: { $or: priceConditions } }] : [];
};
const getContainConditions = contain => {
  if (!contain) return [];
  const conditions = contain.map(property => ({
    [property]: { $exists: true, $not: { $size: 0 } },
  }));
  // Return a flat object rather than an array with a $match object
  return conditions.length > 0 ? [{ $match: { $and: conditions } }] : [];
};
const getBasicMatchConditions = query => [
  ...(query._id ? [{ _id: new ObjectId(query._id) }] : []),
  ...(query.owner ? [{ owner: new ObjectId(query.owner) }] : []),
  ...(query.types ? [{ types: { $in: query.types } }] : []),
  ...(query.member
    ? [
        {
          memberships: {
            $elemMatch: {
              user: new ObjectId(query.member),
              role: 'member',
            },
          },
        },
      ]
    : []),
  ...(query.subscriber
    ? [
        {
          memberships: {
            $elemMatch: {
              user: new ObjectId(query.subscriber),
              role: 'subscriber',
            },
          },
        },
      ]
    : []),
  ...(query.categories?.split(',').length > 0 ? [{ 'products.category': { $in: query.categories?.split(',') } }] : []),
  ...(query.delivery?.split(',').length > 0 ? [{ 'spots.delivery': { $all: query.delivery?.split(',') } }] : []),
];
const getPostableConditions = postableId => {
  if (!postableId) return [];
  return [
    {
      $match: {
        $or: [
          { owner: new ObjectId(postableId) },
          {
            $and: [
              { types: { $elemMatch: { $eq: 'public' } } },
              {
                memberships: {
                  $elemMatch: {
                    user: new ObjectId(postableId),
                  },
                },
              },
            ],
          },
          {
            $and: [
              { types: { $elemMatch: { $in: ['exclusive', 'hidden'] } } },
              {
                memberships: {
                  $elemMatch: {
                    user: new ObjectId(postableId),
                    role: { $ne: 'subscriber' },
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ];
};
export { getBasicMatchConditions, getContainConditions, getDistanceStages, getLocationStages, getLookupStages, getPostableConditions, getPriceConditions, getRequestedLookups };
export default {
  getRequestedLookups,
  getLookupStages,
  getPriceConditions,
  getContainConditions,
  getLocationStages,
  getDistanceStages,
  getBasicMatchConditions,
  getPostableConditions,
};
