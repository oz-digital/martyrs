import middlewareFactory from '../middlewares/index.js';
import controllerFactory from '../services/auth.service.js';
import controllerFactoryTwofa from '../services/twofa.service.js';
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  const controllerTwofa = controllerFactoryTwofa(db);
  const { verifySignUp, verifyUser, authJwt } = middlewareFactory(db);
  app.post(
    '/api/auth/signup',
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      // verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.post('/api/auth/signin', controller.signin);
  app.post('/api/auth/reset-password', [verifyUser.checkUserExist], controllerTwofa.sendcode);
  app.post('/api/auth/update-password', controller.updatePassword);
});
