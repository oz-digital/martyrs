import visitors from '@martyrs/src/modules/auth/controllers/middlewares/visitor.logger.js';
import authRoutes from './controllers/routes/auth.routes.js';
import twofaRoutes from './controllers/routes/twofa.routes.js';
import usersRoutes from './controllers/routes/users.routes.js';
import AuthController from './controllers/services/auth.service.js';
import TwoFaController from './controllers/services/twofa.service.js';
import UsersController from './controllers/services/users.service.js';
import RequestModel from './models/request.model.js';
import RoleModel from './models/role.model.js';
import UserModel from './models/user.model.js';
import VisitorModel from './models/visitor.model.js';

function initializeAuth(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.role = RoleModel(db);
  db.user = UserModel(db);
  db.visitor = VisitorModel(db);
  db.request = RequestModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    authRoutes(app, db, origins, publicPath);
    twofaRoutes(app, db, origins, publicPath);
    usersRoutes(app, db, origins, publicPath);
    const visitorModule = visitors(db);
    app.use(visitorModule.visitorLogger);
  }
}
export const models = {
  RoleModel,
  UserModel,
  VisitorModel,
};
export const routes = {
  authRoutes,
  twofaRoutes,
  usersRoutes,
};
export const controllers = {
  AuthController,
  TwoFaController,
  UsersController,
};
export { initializeAuth as initialize };
export default {
  initialize: initializeAuth,
  models,
  routes,
  controllers,
};
