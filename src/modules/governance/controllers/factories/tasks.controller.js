export default (function (db) {
  return {
    getAllTasks: async (req, res) => {
      try {
        const tasks = await db.task.findAll();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
      }
    },
    getTaskById: async (req, res) => {
      try {
        const task = await db.task.findByPk(req.params.id);
        if (task) {
          res.json(task);
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error });
      }
    },
    createTask: async (req, res) => {
      try {
        const newTask = await db.task.create(req.body);
        res.status(201).json(newTask);
      } catch (error) {
        res.status(400).json({ message: 'Error creating task', error });
      }
    },
    updateTask: async (req, res) => {
      try {
        const updated = await db.task.update(req.body, {
          where: { id: req.params.id },
        });
        if (updated[0] === 1) {
          res.json({ message: 'Task updated successfully' });
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } catch (error) {
        res.status(400).json({ message: 'Error updating task', error });
      }
    },
    deleteTask: async (req, res) => {
      try {
        const deleted = await db.task.destroy({
          where: { id: req.params.id },
        });
        if (deleted) {
          res.json({ message: 'Task deleted successfully' });
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
      }
    },
    assignTask: async (req, res) => {
      try {
        const task = await db.task.findByPk(req.params.id);
        if (task) {
          task.assignedTo = req.body.userId;
          await task.save();
          res.json({ message: 'Task assigned successfully' });
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error assigning task', error });
      }
    },
    completeTask: async (req, res) => {
      try {
        const task = await db.task.findByPk(req.params.id);
        if (task) {
          task.status = 'completed';
          await task.save();
          res.json({ message: 'Task completed successfully' });
        } else {
          res.status(404).json({ message: 'Task not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error completing task', error });
      }
    },
  };
});
