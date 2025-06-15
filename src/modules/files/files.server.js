import filesController from './controllers/files.controller.js';
import filesRoutes from './routes/files.routes.js';
function initializeFiles(app, db, origins, publicPath) {
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    filesRoutes(app, db, origins, publicPath);
  }
}
export const routes = {
  filesRoutes,
};
export const controllers = {
  filesController,
};
export { initializeFiles as initialize };
export default {
  initialize: initializeFiles,
  routes,
  controllers,
};
