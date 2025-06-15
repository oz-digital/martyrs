import taskFactory from '../factories/tasks.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = taskFactory(db);
  app.get('/api/tasks', controller.getAllTasks);
  app.get('/api/tasks/:id', controller.getTaskById);
  app.post('/api/tasks', controller.createTask);
  app.put('/api/tasks/:id', controller.updateTask);
  app.delete('/api/tasks/:id', controller.deleteTask);
  app.post('/api/tasks/:id/assign', controller.assignTask);
  app.post('/api/tasks/:id/complete', controller.completeTask);
});
