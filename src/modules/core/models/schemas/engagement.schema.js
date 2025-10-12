export default (function applyEngagementSchema(schema, db) {
  // Добавление нового поля в схему
  schema.add({ views: { type: Number, default: 0 } });
  // Middleware после агрегации
  schema.post('aggregate', async function (docs) {
    // Если документы отсутствуют, выход из функции
    if (docs.length === 0) return;
    console.log('Post-aggregate hook in engagement schema triggered');
    const model = this._model;
    if (!model) {
      console.error('No model is associated with this schema!');
      return;
    }
    // Обновление просмотров с обработкой ошибок
    try {
      await updateDocumentViews(docs, model);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  });
  // Функция для обновления просмотров документов
  async function updateDocumentViews(docs, model) {
    const updateViewsPromises = docs.map(doc => model.findOneAndUpdate({ _id: doc._id }, { $inc: { views: 1 } }).exec());
    await Promise.all(updateViewsPromises);
  }
});
