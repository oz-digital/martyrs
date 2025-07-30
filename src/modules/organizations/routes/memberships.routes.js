import controllerFactory from '../controllers/memberships.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  // Standard Store routes
  app.get('/api/memberships/read', controller.read);
  app.post('/api/memberships/create', controller.create);
  app.put('/api/memberships/update', controller.update);
  app.post('/api/memberships/delete', controller.deleteMembership);
  
  // Legacy route for backward compatibility
  app.get('/api/memberships', controller.read);
});
