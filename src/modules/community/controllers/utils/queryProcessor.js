function getPeriodConditions(period) {
  const currentDate = new Date();
  const startDate = new Date();
  switch (period) {
    case 'today':
      startDate.setDate(currentDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(currentDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(currentDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(currentDate.getFullYear() - 1);
      break;
    default:
      return [];
  }
  return [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: currentDate, // Добавлено условие, чтобы исключить будущие записи
        },
      },
    },
  ];
}
async function getCategoryConditions(category, user) {
  const aggregationStages = [];
  if (category) {
    switch (category) {
      case 'featured':
        aggregationStages.push({ $match: { tags: { $in: ['Featured'] } } });
        break;
      case 'popular':
        aggregationStages.push({ $sort: { views: -1, likes: -1 } });
        break;
      case 'new':
        aggregationStages.push({ $sort: { createdAt: 1 } });
        break;
    }
  }
  return aggregationStages;
}
export { getCategoryConditions, getPeriodConditions };
export default {
  getPeriodConditions,
  getCategoryConditions,
};
