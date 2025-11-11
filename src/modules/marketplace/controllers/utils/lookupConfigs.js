const lookupConfigs = {
  availability: {
    lookup: {
      from: 'stockavailabilities',
      localField: '_id',
      foreignField: 'storage',
      pipeline: [
        {
          $match: {
            $expr: { $gt: ['$available', 0] },
          },
        },
        {
          $project: {
            _id: 1,
            product: 1,
            variant: 1,
            available: 1,
            quantity: 1,
          },
        },
      ],
      as: 'availability',
    },
  },
  variants: {
    lookup: {
      from: 'variants',
      let: { variantIds: '$availability.variant' },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$variantIds'],
            },
            status: 'published',
          },
        },
        {
          $project: {
            _id: 1,
            product: 1,
            name: 1,
            price: 1,
            unit: 1,
            images: 1,
            sku: 1,
          },
        },
      ],
      as: 'variants',
    },
  },
  products: {
    lookup: {
      from: 'products',
      localField: 'organization',
      foreignField: 'owner.target',
      pipeline: [
        {
          $match: {
            status: 'published',
          },
        },
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
                  unit: 1,
                  images: 1,
                  sku: 1,
                },
              },
            ],
            as: 'variants',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            images: 1,
            category: 1,
            'owner.target': 1,
            'owner.type': 1,
            variants: 1,
          },
        },
      ],
      as: 'products',
    },
  },
  organizations: {
    lookup: {
      from: 'organizations',
      let: { orgIds: '$products.owner.target' },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$orgIds'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            'profile.name': 1,
            'profile.photo': 1,
            'profile.description': 1,
            'profile.tags': 1,
            rating: 1,
            official: 1,
          },
        },
      ],
      as: 'organizations',
    },
  },
};

export default lookupConfigs;
