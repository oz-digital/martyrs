import jwtFactory from '@martyrs/src/modules/auth/controllers/middlewares/authJwt.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../controllers/categories.controller.js';
import verifierFactory from '../middlewares/categories.verifier.js';
const { getInstance } = globalsabac;
export default (function (app, db) {
  const jwt = jwtFactory(db);
  const verifier = verifierFactory(db);
  const abac = getInstance(db);
  const controller = controllerFactory(db);
  // Маршруты API
  app.get('/api/categories', jwt.verifyToken(true), verifier.verifyQuery, controller.read);
  app.post('/api/categories/create', jwt.verifyToken(), verifier.verifyBody, verifier.checkCategoryExistOrNot, abac.middleware('category', 'create'), controller.create);
  app.post('/api/categories/update', jwt.verifyToken(), verifier.verifyBody, verifier.loadCategoryForUpdate, abac.middleware('category', 'edit'), controller.update);
  app.post('/api/categories/updateOrder', jwt.verifyToken(), verifier.verifyOrderBody, abac.middleware('category', 'edit'), controller.updateOrder);
  app.post('/api/categories/delete', jwt.verifyToken(), verifier.verifyDeleteBody, verifier.loadCategoryForDelete, abac.middleware('category', 'delete'), controller.delete);
});
export { controllerFactory };
