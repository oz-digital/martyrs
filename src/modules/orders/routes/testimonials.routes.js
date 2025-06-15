import * as controller from '../controllers/testimonials.controller.js';
import middlewares from '../middlewares.js';
const { authJwt } = middlewares;
export default (function (app) {
  app.get('/api/testimonials', controller.read);
  app.post('/api/testimonials/create', [authJwt.verifyToken], controller.create);
  app.post('/api/testimonials/update', [authJwt.verifyToken], controller.update);
  app.delete('/api/testimonials/delete/:_id', [authJwt.verifyToken], controller.delete);
});
