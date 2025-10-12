import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import controllerFactory from '../controllers/blog.controller.js';
import middlewareFactoryCommunity from '../middlewares/server/index.js';
// ABAC
const { getInstance } = coreabac;
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  const abac = getInstance(db);
  const { authJwt } = middlewareFactoryAuth(db);
  const { verifyBlogpost } = middlewareFactoryCommunity(db);
  app.get(
    '/api/blog/read',
    [
      authJwt.verifyToken(true),
      abac.middleware('blogposts', 'read', {
        allowPublished: true,
        allowUnauthenticated: true,
      }),
    ],
    controller.read
  );
  app.post('/api/blog/create', [authJwt.verifyToken(), abac.middleware('blogposts', 'create'), verifyBlogpost.checkNameNotEmpty, verifyBlogpost.checkBlogpostExistOrNot], controller.create);
  app.post('/api/blog/update', [authJwt.verifyToken(), abac.middleware('blogposts', 'edit'), verifyBlogpost.checkNameNotEmpty, verifyBlogpost.checkBlogpostExistOrNot], controller.update);
  app.delete('/api/blog/delete/:_id', [authJwt.verifyToken(), abac.middleware('blogposts', 'delete')], controller.delete);
});
