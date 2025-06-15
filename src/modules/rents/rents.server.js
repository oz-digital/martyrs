import RentRoutes from './controllers/routes/rents.routes.js';
import RentServices from './controllers/services/rents.services.js';
import RentModel from './models/rent.model.js';
function initializeRenting(app, db, origins, publicPath, options = {}) {
  // Получаем дополнительные поля для модели из options
  const { rentFields = {} } = options;
  // Инициализируем модель с дополнительными полями
  db.rent = RentModel(db, rentFields);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    RentRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  RentModel,
};
export const controllers = {
  RentServices,
  RentRoutes,
};
export { initializeRenting as initialize };
export default {
  initialize: initializeRenting,
  models,
  controllers,
};
