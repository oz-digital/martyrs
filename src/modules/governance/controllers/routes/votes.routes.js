import voteFactory from '../factories/votes.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = voteFactory(db);
  app.post('/api/votings/:votingId/vote', controller.castVote);
  app.get('/api/votings/:votingId/votes', controller.getVotesForVoting);
  app.get('/api/users/:userId/votes', controller.getUserVotes);
  app.put('/api/votes/:id', controller.updateVote);
  app.delete('/api/votes/:id', controller.deleteVote);
});
