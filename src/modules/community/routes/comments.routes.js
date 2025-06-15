import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../controllers/comments.controller.js';
// ABAC
const { getInstance } = globalsabac;
export default (function (app, db) {
  const controller = controllerFactory(db);
  const abac = getInstance(db);
  const { authJwt } = middlewareFactoryAuth(db);
  app.get(
    '/comments/read',
    [
      authJwt.verifyToken(true),
      abac.middleware('comments', 'read', {
        allowPublished: true,
        allowUnauthenticated: true,
      }),
    ],
    controller.read
  );
  app.post('/comments/create', [authJwt.verifyToken(), abac.middleware('comments', 'create')], controller.create);
  app.post('/comments/update/:url', [authJwt.verifyToken(), abac.middleware('comments', 'edit')], controller.update);
  app.delete('/comments/delete/:url', [authJwt.verifyToken(), abac.middleware('comments', 'delete')], controller.delete);
});
