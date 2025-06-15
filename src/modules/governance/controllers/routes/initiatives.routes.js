import initiativeFactory from '../factories/initiatives.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = initiativeFactory(db);
  app.get('/api/initiatives', controller.getAllInitiatives);
  app.get('/api/initiatives/:id', controller.getInitiativeById);
  app.post('/api/initiatives', controller.createInitiative);
  app.put('/api/initiatives/:id', controller.updateInitiative);
  app.delete('/api/initiatives/:id', controller.deleteInitiative);
  app.post('/api/initiatives/:id/approve', controller.approveInitiative);
  app.post('/api/initiatives/:id/reject', controller.rejectInitiative);
});
