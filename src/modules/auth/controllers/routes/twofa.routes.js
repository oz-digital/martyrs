import middlewareFactory from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../services/twofa.service.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  const { verifySignUp, verifyUser } = middlewareFactory(db);
  app.post('/api/twofa/sendcode', [verifySignUp.checkDuplicateUsernameOrEmail], controller.sendcode);
  app.post('/api/twofa/sendcodereset', [verifyUser.checkUserExist], controller.sendcode);
});
