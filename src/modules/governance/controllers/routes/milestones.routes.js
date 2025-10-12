import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import milestonesVerifierFactory from '../../middlewares/milestones.verifier.js';

const { getInstance } = ABAC;

export default function (app, db) {
  const abac = getInstance(db);
  const verifier = milestonesVerifierFactory(db);

  // Основной CRUD для milestones
  const milestonesCRUD = new CRUD({
    app,
    db,
    model: db.milestone,
    modelName: 'milestone',
    basePath: '/api/milestones',

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
      tags: ['milestones', 'governance']
    },

    events: {
      enabled: true,
      logReads: false
    }
  });

  // Кастомные роуты через addAction

  // Get milestone tasks - /api/milestones/:id/tasks
  milestonesCRUD.addAction('tasks', {
    method: 'get',
    path: '/:id/tasks',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const tasks = await db.task.find({
          milestone: req.params.id
        }).populate('assignedTo');
        res.json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Propose task for milestone - /api/milestones/:id/propose-task
  milestonesCRUD.addAction('propose-task', {
    method: 'post',
    path: '/:id/propose-task',
    auth: true,
    handler: async (req, res) => {
      try {
        const milestone = await db.milestone.findById(req.params.id);
        if (!milestone) {
          return res.status(404).json({ error: 'Milestone not found' });
        }

        const { title, description, dueDate } = req.body;

        // Создаём голосование для создания задачи
        const voting = await db.voting.create({
          type: 'create_task',
          targetModel: 'Task',
          title: `Create task: ${title}`,
          description: `Proposal to create task in milestone "${milestone.name}": ${description}`,
          initiative: milestone.initiative,
          milestone: req.params.id,
          threshold: 51,
          participants: [],
          metadata: {
            taskData: {
              title,
              description,
              milestone: req.params.id,
              initiative: milestone.initiative,
              dueDate
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

  return milestonesCRUD;
}