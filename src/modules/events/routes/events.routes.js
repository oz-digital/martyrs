import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import controllerFactory from '../controllers/events.controller.js';
import middlewareFactoryEvents from '../middlewares/server/index.js';
// ABAC
const { getInstance } = coreabac;
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  const abac = getInstance(db);
  const { authJwt } = middlewareFactoryAuth(db);
  const { verifyEvent } = middlewareFactoryEvents(db);
  app.get(
    '/api/events/read',
    [
      authJwt.verifyToken(true),
      abac.middleware('events', 'read', {
        allowPublished: true,
        allowUnauthenticated: true,
      }),
    ],
    controller.read
  );
  app.post('/api/events/create', [authJwt.verifyToken(), abac.middleware('events', 'create'), verifyEvent.checkNameNotEmpty, verifyEvent.checkEventExistOrNot], controller.create);
  app.post('/api/events/update', [authJwt.verifyToken(), abac.middleware('events', 'edit'), verifyEvent.checkNameNotEmpty, verifyEvent.checkEventExistOrNot], controller.update);
  app.post('/api/events/delete', [authJwt.verifyToken(), abac.middleware('events', 'delete')], controller.delete);
});
