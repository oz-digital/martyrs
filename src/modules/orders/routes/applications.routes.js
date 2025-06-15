import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/applications.controller.js';
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  const { authJwt } = middlewareFactoryAuth(db);
  app.post('/applications', controller.create);
  app.get('/applications', controller.read);
  app.post('/applications/:_id', controller.update);
  app.delete('/applications/:_id', controller.delete);
  app.get('/applications/:_id', controller.get);
  app.post('/applications/telegram-webhook', controller.handleTelegramWebhook);
});
