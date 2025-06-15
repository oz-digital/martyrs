export default (function (db) {
  return {
    getAllVotings: async (req, res) => {
      try {
        const votings = await db.voting.findAll();
        res.json(votings);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching votings', error });
      }
    },
    getVotingById: async (req, res) => {
      try {
        const voting = await db.voting.findByPk(req.params.id);
        if (voting) {
          res.json(voting);
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching voting', error });
      }
    },
    createVoting: async (req, res) => {
      try {
        const newVoting = await db.voting.create(req.body);
        res.status(201).json(newVoting);
      } catch (error) {
        res.status(400).json({ message: 'Error creating voting', error });
      }
    },
    updateVoting: async (req, res) => {
      try {
        const updated = await db.voting.update(req.body, {
          where: { id: req.params.id },
        });
        if (updated[0] === 1) {
          res.json({ message: 'Voting updated successfully' });
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(400).json({ message: 'Error updating voting', error });
      }
    },
    deleteVoting: async (req, res) => {
      try {
        const deleted = await db.voting.destroy({
          where: { id: req.params.id },
        });
        if (deleted) {
          res.json({ message: 'Voting deleted successfully' });
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting voting', error });
      }
    },
    startVoting: async (req, res) => {
      try {
        const voting = await db.voting.findByPk(req.params.id);
        if (voting) {
          voting.status = 'active';
          voting.startDate = new Date();
          await voting.save();
          res.json({ message: 'Voting started successfully' });
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error starting voting', error });
      }
    },
    endVoting: async (req, res) => {
      try {
        const voting = await db.voting.findByPk(req.params.id);
        if (voting) {
          voting.status = 'completed';
          voting.endDate = new Date();
          await voting.save();
          res.json({ message: 'Voting ended successfully' });
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error ending voting', error });
      }
    },
    getVotingResults: async (req, res) => {
      try {
        const voting = await db.voting.findByPk(req.params.id, {
          include: [{ model: db.vote }],
        });
        if (voting) {
          // Здесь вы можете добавить логику для подсчета результатов
          res.json({ voting, results: 'Результаты голосования' });
        } else {
          res.status(404).json({ message: 'Voting not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching voting results', error });
      }
    },
  };
});
