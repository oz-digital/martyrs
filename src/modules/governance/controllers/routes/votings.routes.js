import votingFactory from '../factories/votings.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = votingFactory(db);
  app.get('/api/votings', controller.getAllVotings);
  app.get('/api/votings/:id', controller.getVotingById);
  app.post('/api/votings', controller.createVoting);
  app.put('/api/votings/:id', controller.updateVoting);
  app.delete('/api/votings/:id', controller.deleteVoting);
  app.post('/api/votings/:id/start', controller.startVoting);
  app.post('/api/votings/:id/end', controller.endVoting);
  app.get('/api/votings/:id/results', controller.getVotingResults);
});
