import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import middlewareFactoryAccesses from '@martyrs/src/modules/organizations/middlewares/verifyAccesses.js';
import controllerFactory from '../controllers/gallery.controller.js';
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  const { authJwt } = middlewareFactoryAuth(db);
  const { verifyAccess, handleAccessResult } = middlewareFactoryAccesses(db);
  app.get('/api/gallery/read', [authJwt.verifyToken(true), verifyAccess('gallery', 'read'), handleAccessResult({ allowPublished: true, allowUnauthenticated: true })], controller.read);
  app.post('/api/gallery/create', [authJwt.verifyToken(), verifyAccess('gallery', 'create'), handleAccessResult()], controller.create);
  app.put(
    '/api/gallery/update',
    [
      authJwt.verifyToken(),
      verifyAccess('gallery', 'edit'),
      handleAccessResult({
        allowOwnResources: true,
      }),
    ],
    controller.update
  );
  app.delete('/api/gallery/delete', [authJwt.verifyToken(), verifyAccess('gallery', 'delete'), handleAccessResult()], controller.delete);
});
