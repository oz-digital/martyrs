import controllerFactory from '../controllers/memberships.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  app.get('/api/memberships', controller.read);
  // Add organization membder
  app.post('/api/memberships/create', controller.create);
  // Update organization membder
  app.post('/api/memberships/update', controller.update);
  // Delete organization membder
  app.post('/api/memberships/delete', controller.deleteMembership);
});
