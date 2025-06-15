export default (function (db) {
  return {
    castVote: async (req, res) => {
      try {
        const newVote = await db.vote.create({
          votingId: req.params.votingId,
          userId: req.body.userId,
          choice: req.body.choice,
        });
        res.status(201).json(newVote);
      } catch (error) {
        res.status(400).json({ message: 'Error casting vote', error });
      }
    },
    getVotesForVoting: async (req, res) => {
      try {
        const votes = await db.vote.findAll({
          where: { votingId: req.params.votingId },
        });
        res.json(votes);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching votes', error });
      }
    },
    getUserVotes: async (req, res) => {
      try {
        const votes = await db.vote.findAll({
          where: { userId: req.params.userId },
        });
        res.json(votes);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching user votes', error });
      }
    },
    updateVote: async (req, res) => {
      try {
        const updated = await db.vote.update(req.body, {
          where: { id: req.params.id },
        });
        if (updated[0] === 1) {
          res.json({ message: 'Vote updated successfully' });
        } else {
          res.status(404).json({ message: 'Vote not found' });
        }
      } catch (error) {
        res.status(400).json({ message: 'Error updating vote', error });
      }
    },
    deleteVote: async (req, res) => {
      try {
        const deleted = await db.vote.destroy({
          where: { id: req.params.id },
        });
        if (deleted) {
          res.json({ message: 'Vote deleted successfully' });
        } else {
          res.status(404).json({ message: 'Vote not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error deleting vote', error });
      }
    },
  };
});
