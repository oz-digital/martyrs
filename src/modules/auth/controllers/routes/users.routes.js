import middlewareFactory from '../middlewares/index.js';
import controllerFactory from '../services/users.service.js';
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  // Middlewares
  const { authJwt, verifyUser } = middlewareFactory(db);
  // Create a User
  app.post('/api/users', [authJwt.verifyToken(), verifyUser.checkDuplicateUsername], controller.create);
  // Fetch Users
  app.get('/api/users', controller.read);
  // Update User by _id
  app.put('/api/users/:_id', [authJwt.verifyToken(), verifyUser.checkDuplicateUsername], controller.update);
  // Delete User by _id
  app.delete('/api/users/:_id', [authJwt.verifyToken()], controller.remove);
});
