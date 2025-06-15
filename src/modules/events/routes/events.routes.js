import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../controllers/events.controller.js';
import middlewareFactoryEvents from '../middlewares/server/index.js';
// ABAC
const { getInstance } = globalsabac;
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
