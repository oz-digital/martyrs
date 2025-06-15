import controllerFactory from '../controllers/tickets.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = controllerFactory(db, publicPath);
  // Read all tickets
  app.get('/api/tickets', controller.read);
  // Create a new ticket
  app.post('/api/tickets/create', controller.create);
  // Update a ticket
  app.post('/api/tickets/update', controller.update);
  // Delete a ticket
  app.post('/api/tickets/delete', controller.delete);
});
