import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../controllers/reactions.controller.js';
// ABAC
const { getInstance } = globalsabac;
export default (function (app, db) {
  const controller = controllerFactory(db);
  const abac = getInstance(db);
  const { authJwt } = middlewareFactoryAuth(db);
  app.get('/api/reactions/read', [authJwt.verifyToken(true)], controller.read);
  app.post('/api/reactions/create', [authJwt.verifyToken()], controller.create);
  app.post('/api/reactions/update', [authJwt.verifyToken()], controller.update);
  app.post('/api/reactions/delete', [authJwt.verifyToken()], controller.delete);
});
