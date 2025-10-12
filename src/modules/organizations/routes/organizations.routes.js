import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import controllerFactory from '../controllers/organizations.controller.js';
const { getInstance } = coreabac;
export default (function (app, db) {
  const controller = controllerFactory(db);
  const { authJwt } = middlewareFactoryAuth(db);
  const abac = getInstance(db);
  app.get(
    '/api/organizations',
    [
      authJwt.verifyToken(true),
      // abac.middleware('organizations', 'read', {
      //   allowPublished: true,
      //   allowUnauthenticated: true
      // })
    ],
    controller.read
  );
  app.post('/api/organizations/create', controller.create);
  app.post('/api/organizations/:_id/update', controller.update);
  app.delete('/api/organizations/:_id/delete', controller.delete);
  app.get('/api/organizations/check-accesses', [authJwt.verifyToken()], controller.checkAccesses);
});
