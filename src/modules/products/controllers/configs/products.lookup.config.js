// @martyrs/src/modules/products/controllers/utils/productLookupConfigs.js
export default  {
  // NEW: Лукап для availability продуктов из inventory модуля
  inventory: {
    lookup: {
      from: 'stockavailabilities',
      let: { productId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$product', '$$productId'] }
          }
        },
        {
          $lookup: {
            from: 'spots',
            localField: 'storage',
            foreignField: '_id',
            as: 'storageInfo'
          }
        },
        {
          $unwind: { path: '$storageInfo', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            _id: 1,
            storage: 1,
            storageName: '$storageInfo.profile.name',
            available: 1
          }
        }
      ],
      as: 'availability'
    },
    additionalStages: [
      // Этап для расчета общего доступного количества
      {
        $addFields: {
          availabilityDetails: '$availability',
          available: {
            $sum: '$availability.available'
          },
          totalStock: {
            $sum: '$availability.quantity'
          },
          storageCount: {
            $size: { $ifNull: ['$availability', []] }
          }
        }
      }
    ]
  },
  variants: {
    lookup: {
      from: 'variants',
      localField: '_id',
      foreignField: 'product',
      as: 'variants',
      pipeline: [
        {
          $lookup: {
            from: 'stockavailabilities',
            localField: '_id',
            foreignField: 'variant',
            as: 'availability'
          }
        },
        {
          $addFields: {
            available: {
              $sum: '$availability.available'
            }
          }
        }
      ]
    }
  },
  recommended: {
    lookup: {
      from: 'products',
      localField: 'recommended',
      foreignField: '_id',
      as: 'recommended',
      pipeline: [
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'product',
            as: 'variants'
          }
        }
      ]
    }
  },
  // Лукап для категорий продукта
  categories: {
    lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category'
    },
    additionalStages: [{
      $addFields: {
        category: {
          $map: {
            input: '$category',
            as: 'cat',
            in: {
              _id: '$$cat._id',
              name: '$$cat.name',
              description: '$$cat.description',
              url: '$$cat.url'
            }
          }
        }
      }
    }]
  },
  // Лукап для аренд продукта
  rents: {
    lookup: {
      from: 'rents',
      localField: '_id',
      foreignField: 'product',
      as: 'rents'
    }
  }
};