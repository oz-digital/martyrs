теперь добавь фильтрацию по выбранному периоду на фронте и беке. На фронте в lookups надо добавить rents в случае если есть период (чтобы не грузить лишний раз), в products.lookup.config
   добавить rents и добавить в product.query фильтрацию по доступности с учетом quantityЖ Для фильтрации доступных товаров при агрегации на основе аренд, вам нужно использовать $lookup для
   проверки пересечений с активными арендами. Вот пример агрегации:

  javascript
  const checkAvailability = async (startDate, endDate) => {
    const pipeline = [
      // Фильтр по нужным критериям товаров
      {
        $match: {
          listing: 'rent',
          status: 'active' // или другие условия
        }
      },
      
      // Присоединяем аренды для каждого товара
      {
        $lookup: {
          from: 'rents',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product', '$productId'] },
                    // Только активные аренды
                    { $in: ['$status', ['confirmed', 'active']] },
                    // Проверка пересечения дат
                    {
                      $or: [
                        // Аренда начинается в запрашиваемый период
                        {
                          $and: [
                            { $gte: ['$startDate', new Date(startDate)] },
                            { $lte: ['$startDate', new Date(endDate)] }
                          ]
                        },
                        // Аренда заканчивается в запрашиваемый период
                        {
                          $and: [
                            { $gte: ['$endDate', new Date(startDate)] },
                            { $lte: ['$endDate', new Date(endDate)] }
                          ]
                        },
                        // Аренда полностью покрывает запрашиваемый период
                        {
                          $and: [
                            { $lte: ['$startDate', new Date(startDate)] },
                            { $gte: ['$endDate', new Date(endDate)] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'activeRents'
        }
      },
      
      // Фильтруем только доступные товары
      {
        $match: {
          activeRents: { $size: 0 } // Нет активных аренд в этот период
        }
      },
      
      // Убираем поле activeRents из результата
      {
        $project: {
          activeRents: 0
        }
      }
    ];

    return await Product.aggregate(pipeline);
  };
  Если у вас товары могут иметь количество (например, несколько единиц одного товара), то нужно модифицировать логику:

  javascript
  const checkAvailabilityWithQuantity = async (startDate, endDate, requestedQuantity = 1) => {
    const pipeline = [
      {
        $match: {
          listing: 'rent',
          status: 'active'
        }
      },
      
      {
        $lookup: {
          from: 'rents',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product', '$productId'] },
                    { $in: ['$status', ['confirmed', 'active']] },
                    // Проверка пересечения дат (та же логика)
                  ]
                }
              }
            },
            // Суммируем количество в активных арендах
            {
              $group: {
                _id: null,
                totalRented: { $sum: '$quantity' }
              }
            }
          ],
          as: 'rentInfo'
        }
      },
      
      // Добавляем поле с доступным количеством
      {
        $addFields: {
          rentedQuantity: {
            $ifNull: [{ $arrayElemAt: ['$rentInfo.totalRented', 0] }, 0]
          },
          availableQuantity: {
            $subtract: [
              { $ifNull: ['$quantity', 1] }, // quantity товара или 1 по умолчанию
              { $ifNull: [{ $arrayElemAt: ['$rentInfo.totalRented', 0] }, 0] }
            ]
          }
        }
      },
      
      // Фильтруем товары с достаточным количеством
      {
        $match: {
          availableQuantity: { $gte: requestedQuantity }
        }
      },
      
      // Убираем временные поля
      {
        $project: {
          rentInfo: 0,
          rentedQuantity: 0
        }
      }
    ];

    return await Product.aggregate(pipeline);
  };



   сделать нужно минималистично и ничего кроме этого