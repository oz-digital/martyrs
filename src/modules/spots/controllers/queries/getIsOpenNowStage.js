export default (function getIsOpenNowStage() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    $addFields: {
      isOpenNow: {
        $let: {
          vars: {
            // Найдем особую дату на сегодня, если она есть
            specialDay: {
              $filter: {
                input: { $ifNull: ['$worktime.special', []] },
                as: 'special',
                cond: {
                  $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$$special.date' } }, { $dateToString: { format: '%Y-%m-%d', date: new Date() } }],
                },
              },
            },
          },
          in: {
            $cond: {
              if: { $gt: [{ $size: '$$specialDay' }, 0] },
              then: {
                $let: {
                  vars: { day: { $arrayElemAt: ['$$specialDay', 0] } },
                  in: {
                    $cond: {
                      if: '$$day.isOpen',
                      then: {
                        $anyElementTrue: {
                          $map: {
                            input: { $ifNull: ['$$day.periods', []] },
                            as: 'period',
                            in: {
                              $and: [{ $lte: ['$$period.open', currentTime] }, { $gt: ['$$period.close', currentTime] }],
                            },
                          },
                        },
                      },
                      else: false,
                    },
                  },
                },
              },
              else: {
                $let: {
                  vars: {
                    regularDay: {
                      $filter: {
                        input: { $ifNull: ['$worktime.regular', []] },
                        as: 'day',
                        cond: { $eq: ['$$day.dayOfWeek', currentDay] },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: '$$regularDay' }, 0] },
                      then: {
                        $let: {
                          vars: { day: { $arrayElemAt: ['$$regularDay', 0] } },
                          in: {
                            $cond: {
                              if: '$$day.isOpen',
                              then: {
                                $anyElementTrue: {
                                  $map: {
                                    input: { $ifNull: ['$$day.periods', []] },
                                    as: 'period',
                                    in: {
                                      $and: [{ $lte: ['$$period.open', currentTime] }, { $gt: ['$$period.close', currentTime] }],
                                    },
                                  },
                                },
                              },
                              else: false,
                            },
                          },
                        },
                      },
                      else: false,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
});
