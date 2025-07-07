const lookupConfigs = {
  products: {
    lookup: {
      from: 'products',
      localField: '_id',
      foreignField: 'owner.target',
      pipeline: [
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'product',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  price: 1,
                  quantity: 1,
                  type: 1,
                },
              },
            ],
            as: 'variants',
          },
        },
      ],
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