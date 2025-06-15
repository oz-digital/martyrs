// @martyrs/src/modules/products/controllers/utils/productLookupConfigs.js
export default  {
  // Лукап для leftover-ов продукта
  leftovers: {
    lookup: {
      from: 'leftovers',
      let: { productId: '$_id', ingredientsIds: '$ingredients._id' },
      pipeline: [
        { $unwind: '$positions' },
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ['$positions._id', '$$productId'] },
                { $in: ['$positions._id', { $ifNull: ['$$ingredientsIds', []] }] }
              ]
            }
          }
        },
        {
          $addFields: {
            'positions.quantity': {
              $cond: {
                if: { $eq: ['$type', 'stock-in'] },
                then: '$positions.quantity',
                else: { $multiply: ['$positions.quantity', -1] }
              }
            }
          }
        },
        {
          $project: {
            _id: '$positions._id',
            quantity: '$positions.quantity',
            name: '$positions.name'
          }
        }
      ],
      as: 'leftovers'
    },
    additionalStages: [
      // Этап для расчета количеств по ингредиентам
      {
        $addFields: {
          ingredientsQuantities: {
            $cond: {
              if: { $isArray: '$ingredients' },
              then: {
                $map: {
                  input: '$ingredients',
                  as: 'ingredient',
                  in: {
                    $let: {
                      vars: {
                        ingredientId: '$$ingredient._id',
                        ingredientQuantity: { $ifNull: ['$$ingredient.quantity', 0] }
                      },
                      in: {
                        $divide: [
                          {
                            $sum: {
                              $map: {
                                input: '$leftovers',
                                as: 'leftover',
                                in: {
                                  $cond: {
                                    if: { $eq: ['$$leftover._id', '$$ingredientId'] },
                                    then: '$$leftover.quantity',
                                    else: 0
                                  }
                                }
                              }
                            }
                          },
                          {
                            $cond: {
                              if: { $eq: ['$$ingredientQuantity', 0] },
                              then: 1,
                              else: '$$ingredientQuantity'
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              },
              else: []
            }
          }
        }
      },
      // Этап для расчета доступного количества
      {
        $set: {
          available: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$ingredients', []] } }, 0] },
              then: { $floor: { $min: '$ingredientsQuantities' } },
              else: { $sum: '$leftovers.quantity' }
            }  
          }
        }
      }
    ]
  },
  // Лукап для категорий продукта
  categories: {
    lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category'
    },
    additionalStages: [
      // Проецируем только нужные поля для каждой категории
      {
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
      }
    ]
  }
};