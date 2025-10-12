import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import initiativesVerifierFactory from '../../middlewares/initiatives.verifier.js';

const { getInstance } = ABAC;

export default function (app, db) {
  const abac = getInstance(db);
  const verifier = initiativesVerifierFactory(db);

  // Основной CRUD для initiatives
  const initiativesCRUD = new CRUD({
    app,
    db,
    model: db.initiative,
    modelName: 'initiative',
    basePath: '/api/initiatives',

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
      ttl: 300,
      tags: ['initiatives', 'governance']
    },

    events: {
      enabled: true,
      logReads: false
    }
  });

  // Кастомные роуты через addAction

  // Get initiative milestones - /api/initiatives/:id/milestones
  initiativesCRUD.addAction('milestones', {
    method: 'get',
    path: '/:id/milestones',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const milestones = await db.milestone.find({
          initiative: req.params.id
        }).populate('owner contributors');
        res.json(milestones);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Propose task for initiative - /api/initiatives/:id/propose-task
  initiativesCRUD.addAction('propose-task', {
    method: 'post',
    path: '/:id/propose-task',
    auth: true,
    handler: async (req, res) => {
      try {
        const { title, description, milestone, dueDate } = req.body;

        // Создаём голосование для создания задачи
        const voting = await db.voting.create({
          type: 'create_task',
          targetModel: 'Task',
          title: `Create task: ${title}`,
          description: `Proposal to create task: ${description}`,
          initiative: req.params.id,
          milestone: milestone,
          threshold: 51,
          participants: [],
          metadata: {
            taskData: {
              title,
              description,
              milestone,
              dueDate,
              initiative: req.params.id
            }
          }
        });

        res.status(201).json(voting);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return initiativesCRUD;
}