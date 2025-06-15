import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
const reactionControllerFactory = db => {
  const Reaction = db.reaction;
  const read = async (req, res) => {
    let query = {};
    // Uncomment and correctly implement the user query
    if (req.query.user) {
      query.user = new ObjectId(req.query.user);
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.target) {
      query.target = req.query.target;
    }
    if (req.query.targetString) {
      query.targetString = req.query.targetString;
    }
    try {
      // Assuming 'Reaction' is a model, querying with the constructed 'query' object
      const reactions = await Reaction.find(query).populate('user');
      if (!reactions) {
        return res.status(404).send({ errorCode: 'REACTIONS_NOT_FOUND' });
      }
      res.send(reactions);
    } catch (err) {
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const create = async (req, res) => {
    try {
      const reaction = new Reaction(req.body);
      const savedReaction = await reaction.save();
      res.status(200).send({ reaction: savedReaction });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err });
    }
  };
  const update = async (req, res) => {
    try {
      let query = { _id: new ObjectId(req.params._id) };
      // Добавить проверку на targetString в запросе, если target не указан
      if (req.body.targetString && !req.body.target) {
        query.targetString = req.body.targetString;
      }
      const updatedReaction = await Reaction.findOneAndUpdate(query, { $set: req.body }, { new: true });
      if (!updatedReaction) {
        return res.status(404).send({ message: 'Something wrong when updating reaction.' });
      }
      res.status(200).send(updatedReaction);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err });
    }
  };
  const deleteReaction = async (req, res) => {
    try {
      let query = { _id: new ObjectId(req.body._id) };
      // Добавить проверку на targetString в запросе, если target не указан
      if (req.body.targetString && !req.body.target) {
        query.targetString = req.body.targetString;
      }
      const deletedReaction = await Reaction.findOneAndDelete(query);
      if (!deletedReaction) {
        return res.status(404).send({ message: 'Reaction is not deleted.' });
      }
      res.status(200).send(deletedReaction);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteReaction,
  };
};
export default reactionControllerFactory;
