import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';
import votingsVerifierFactory from '../../middlewares/votings.verifier.js';

const { getInstance } = ABAC;

export default function (app, db) {
  const abac = getInstance(db);
  const verifier = votingsVerifierFactory(db);

  // Основной CRUD для votings
  const votingsCRUD = new CRUD({
    app,
    db,
    model: db.voting,
    modelName: 'voting',
    basePath: '/api/votings',

    auth: { read: false },

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
      tags: ['votings', 'governance']
    },

    events: {
      enabled: true,
      logReads: false
    }
  });

  // Кастомные действия

  // Cast vote - /api/votings/:id/vote
  votingsCRUD.addAction('vote', {
    method: 'post',
    path: '/:id/vote',
    auth: true,
    handler: async (req, res) => {
      try {
        const voting = await db.voting.findById(req.params.id);

        if (!voting) {
          return res.status(404).json({ error: 'Voting not found' });
        }

        if (voting.result !== 'pending') {
          return res.status(400).json({ error: 'Voting is closed' });
        }

        const { value, comment } = req.body;
        const userId = req.user?._id;

        // Проверяем, может ли пользователь голосовать
        if (voting.participants?.length > 0 && !voting.participants.includes(userId)) {
          return res.status(403).json({ error: 'Not authorized to vote' });
        }

        // Проверяем, не голосовал ли пользователь уже
        const existingVote = await db.vote.findOne({
          voting: voting._id,
          voter: userId
        });

        if (existingVote) {
          return res.status(400).json({ error: 'Already voted' });
        }

        // Создаём голос
        const vote = await db.vote.create({
          voting: voting._id,
          voter: userId,
          value: value,
          comment: comment
        });

        // Проверяем результаты голосования
        await checkVotingResults(voting, db);

        res.status(201).json({ message: 'Vote cast successfully', vote });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get voting results - /api/votings/:id/results
  votingsCRUD.addAction('results', {
    method: 'get',
    path: '/:id/results',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const voting = await db.voting.findById(req.params.id);

        if (!voting) {
          return res.status(404).json({ error: 'Voting not found' });
        }

        const votes = await db.vote.find({ voting: voting._id })
          .populate('voter', 'name email');

        const totalVotes = votes.length;
        const yesVotes = votes.filter(v => v.value === 1 || v.value === true).length;
        const noVotes = votes.filter(v => v.value === 0 || v.value === false).length;
        const abstainVotes = totalVotes - yesVotes - noVotes;

        const results = {
          voting: voting,
          totalVotes: totalVotes,
          yesVotes: yesVotes,
          noVotes: noVotes,
          abstainVotes: abstainVotes,
          percentageYes: totalVotes > 0 ? (yesVotes / totalVotes * 100).toFixed(2) : 0,
          percentageNo: totalVotes > 0 ? (noVotes / totalVotes * 100).toFixed(2) : 0,
          threshold: voting.threshold || 51,
          result: voting.result,
          votes: votes
        };

        res.json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Close voting - /api/votings/:id/close
  votingsCRUD.addAction('close', {
    method: 'post',
    path: '/:id/close',
    auth: true,
    handler: async (req, res) => {
      try {
        const voting = await db.voting.findById(req.params.id);

        if (!voting) {
          return res.status(404).json({ error: 'Voting not found' });
        }

        if (voting.result !== 'pending') {
          return res.status(400).json({ error: 'Voting is already closed' });
        }

        const result = await checkVotingResults(voting, db);

        res.json({ message: 'Voting closed', result: result });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return votingsCRUD;
}

// Вспомогательная функция для проверки результатов голосования
async function checkVotingResults(voting, db) {
  const votes = await db.vote.find({ voting: voting._id });
  const totalVotes = votes.length;
  const yesVotes = votes.filter(v => v.value === 1 || v.value === true).length;
  const percentageYes = totalVotes > 0 ? (yesVotes / totalVotes * 100) : 0;

  // Проверяем, достигнут ли порог
  if (percentageYes >= (voting.threshold || 51)) {
    voting.result = 'approved';

    // Выполняем действие в зависимости от типа голосования
    if (voting.type === 'create_task' && voting.metadata?.taskData) {
      const task = await db.task.create({
        ...voting.metadata.taskData,
        proposedByVoting: voting._id,
        status: 'not_started'
      });

      voting.targetId = task._id;
    } else if (voting.type === 'approve_task' && voting.targetId) {
      const task = await db.task.findById(voting.targetId);
      if (task) {
        task.status = 'completed';
        task.completedDate = new Date();
        await task.save();
      }
    }
  } else if (totalVotes >= (voting.participants?.length || 1)) {
    voting.result = 'rejected';
  }

  await voting.save();
  return voting.result;
}