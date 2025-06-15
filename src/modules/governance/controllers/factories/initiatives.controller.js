export default (function (db) {
  return {
    getAllInitiatives: async (req, res) => {
      try {
        const initiatives = await db.initiative.find();
        res.json(initiatives);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching initiatives', error });
      }
    },
    getInitiativeById: async (req, res) => {
      try {
        const initiative = await db.initiative.findByPk(req.params.id);
        if (initiative) {
          res.json(initiative);
        } else {
          res.status(404).json({ message: 'Initiative not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching initiative', error });
      }
    },
    createInitiative: async (req, res) => {
      try {
        const newInitiative = await db.initiative.create(req.body);
        res.status(201).json(newInitiative);
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Error creating initiative', error });
      }
    },
    updateInitiative: async (req, res) => {
      try {
        const updated = await db.initiative.update(req.body, {
          where: { id: req.params.id },
        });
        if (updated[0] === 1) {
          res.json({ message: 'Initiative updated successfully' });
        } else {
          res.status(404).json({ message: 'Initiative not found' });
        }
      } catch (error) {
        res.status(400).json({ message: 'Error updating initiative', error });
      }
    },
    deleteInitiative: async (req, res) => {
      try {
        const deleted = await db.initiative.destroy({
          where: { id: req.params.id },
        });
        if (deleted) {
          res.json({ message: 'Initiative deleted successfully' });
        } else {
          res.status(404).json({ message: 'Initiative not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting initiative', error });
      }
    },
    approveInitiative: async (req, res) => {
      try {
        const initiative = await db.initiative.findByPk(req.params.id);
        if (initiative) {
          initiative.status = 'approved';
          await initiative.save();
          res.json({ message: 'Initiative approved successfully' });
        } else {
          res.status(404).json({ message: 'Initiative not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error approving initiative', error });
      }
    },
    rejectInitiative: async (req, res) => {
      try {
        const initiative = await db.initiative.findByPk(req.params.id);
        if (initiative) {
          initiative.status = 'rejected';
          await initiative.save();
          res.json({ message: 'Initiative rejected successfully' });
        } else {
          res.status(404).json({ message: 'Initiative not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error rejecting initiative', error });
      }
    },
  };
});
