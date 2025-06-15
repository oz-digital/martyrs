import ReportsController from './controllers/reports.controller.js';
import ReportModel from './models/report.model.js';
import reportsRoutes from './routes/reports.routes.js';
function initializeReports(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.report = ReportModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    reportsRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  ReportModel,
};
export const routes = {
  reportsRoutes,
};
export const controllers = {
  ReportsController,
};
export { initializeReports as initialize };
export default {
  initialize: initializeReports,
  models,
  routes,
  controllers,
};
