import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';
import votesVerifierFactory from '../../middlewares/votes.verifier.js';

const { getInstance } = ABAC;

export default function (app, db) {
  const abac = getInstance(db);
  const verifier = votesVerifierFactory(db);

  // Основной CRUD для votes
  const votesCRUD = new CRUD({
    app,
    db,
    model: db.vote,
    modelName: 'vote',
    basePath: '/api/votes',

    auth: {
      read: false,
      create: true  // Votes are typically created via /api/votings/:id/vote
    },

    verifiers: {
      create: verifier.createVerifier,
      read: verifier.readVerifier,
      update: verifier.updateVerifier,
      delete: verifier.deleteVerifier
    },

    abac: abac,

    policies: {
      read: { enabled: false }
    },

    cache: {
      enabled: true,
      ttl: 60,
      tags: ['votes', 'governance']
    },

    events: {
      enabled: true,
      logReads: false
    }
  });

  return votesCRUD;
}
