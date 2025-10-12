import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import tasksVerifierFactory from '../../middlewares/tasks.verifier.js';

const { getInstance } = ABAC;

export default function (app, db) {
  const abac = getInstance(db);
  const verifier = tasksVerifierFactory(db);

  // Основной CRUD для tasks
  const tasksCRUD = new CRUD({
    app,
    db,
    model: db.task,
    modelName: 'task',
    basePath: '/api/tasks',

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
      tags: ['tasks', 'governance']
    },

    events: {
      enabled: true,
      logReads: false
    }
  });

  // Кастомные действия через addAction

  // Assign task - /api/tasks/:id/assign
  tasksCRUD.addAction('assign', {
    method: 'post',
    path: '/:id/assign',
    auth: true,
    handler: async (req, res) => {
      try {
        const task = await db.task.findById(req.params.id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const { userId } = req.body;
        const user = await db.user.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        task.assignedTo = userId;
        task.status = 'in_progress';
        await task.save();

        res.json({ message: 'Task assigned successfully', task });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Submit for review - /api/tasks/:id/submit-for-review
  tasksCRUD.addAction('submit-for-review', {
    method: 'post',
    path: '/:id/submit-for-review',
    auth: true,
    handler: async (req, res) => {
      try {
        const task = await db.task.findById(req.params.id)
          .populate('assignedTo')
          .populate('milestone');

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        if (task.status !== 'in_progress') {
          return res.status(400).json({ error: 'Task must be in progress to submit for review' });
        }

        // Создаём голосование для приёмки задачи
        const voting = await db.voting.create({
          type: 'approve_task',
          targetModel: 'Task',
          targetId: task._id,
          title: `Approve completion of task: ${task.title}`,
          description: `Review and approve the completion of task "${task.title}"`,
          initiative: task.initiative,
          milestone: task.milestone,
          threshold: 51,
          participants: [],
          metadata: {
            taskId: task._id,
            completedBy: task.assignedTo
          }
        });

        task.status = 'review';
        task.completionVoting = voting._id;
        await task.save();

        res.json({ message: 'Task submitted for review', task, voting });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Complete task - /api/tasks/:id/complete
  tasksCRUD.addAction('complete', {
    method: 'post',
    path: '/:id/complete',
    auth: true,
    handler: async (req, res) => {
      try {
        const task = await db.task.findById(req.params.id);

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        if (task.status !== 'review') {
          return res.status(400).json({ error: 'Task must be in review to complete' });
        }

        // Проверяем результат голосования если есть
        if (task.completionVoting) {
          const voting = await db.voting.findById(task.completionVoting);
          if (voting && voting.result !== 'approved') {
            return res.status(400).json({ error: 'Task completion not approved by voting' });
          }
        }

        task.status = 'completed';
        task.completedDate = new Date();
        await task.save();

        res.json({ message: 'Task completed successfully', task });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return tasksCRUD;
}