const lookupConfigs = {
  products: {
    lookup: {
      from: 'products',
      localField: '_id',
      foreignField: 'owner.target',
      as: 'products',
    },
    additionalStages: [
      {
        $addFields: { numberOfProducts: { $size: '$products' } },
      },
    ],
  },
  blogposts: {
    lookup: {
      from: 'blogposts',
      localField: '_id',
      foreignField: 'owner.target',
      as: 'blogposts',
    },
  },
  departments: {
    lookup: {
      from: 'departments',
      localField: '_id',
      foreignField: 'organization',
      as: 'departments',
    },
  },
  spots: {
    lookup: {
      from: 'spots',
      localField: '_id',
      foreignField: 'organization',
      as: 'spots',
    },
  },
  memberships: {
    lookup: {
      from: 'memberships',
      localField: '_id',
      foreignField: 'target',
      as: 'memberships',
    },
  },
};
export default lookupConfigs;
