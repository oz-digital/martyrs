import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';

const controllerFactory = db => {
  const Leftover = db.leftover;

  const read = async (req, res) => {
    try {
      
      let stages = [
        ...queryProcessorGlobals.getSearchOptions(req.query.search, {
          fields: ['positions.name']
        }),
        ...queryProcessorGlobals.getBasicOptions(req.query),
        // For creator
        queryProcessorGlobals.getCreatorUserLookupStage(),
        queryProcessorGlobals.getCreatorOrganizationLookupStage(),
        // For owner
        queryProcessorGlobals.getOwnerUserLookupStage(),
        queryProcessorGlobals.getOwnerOrganizationLookupStage(),
        queryProcessorGlobals.getAddFieldsCreatorOwnerStage(),
        // Pagination
        ...queryProcessorGlobals.getSortingOptions(req.query.sortParam, req.query.sortOrder),
        ...queryProcessorGlobals.getPaginationOptions(req.query.skip, req.query.limit),
      ];

      const leftoveres = await Leftover.aggregate(stages).exec();

      if (!leftoveres) {
        return res.status(404).send({ message: 'LEFTOVERES_NOT_FOUND' });
      }

      res.status(200).send(leftoveres);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'ERROR_GET_ALL_LEFTOVERES' });
    }
  };

  const create = async (req, res) => {
    try {

      const leftover = await Leftover.create({
        organization: req.body.organization,
        type: req.body.type,
        order: req.body.order,
        comment: req.body.comment,
        positions: req.body.positions,
        creator: req.body.creator,
        owner: req.body.owner,
      });

      if (!leftover) {
        return res.status(404).send({ message: 'ERROR_CREATING_LEFTOVER' });
      }

      res.status(200).send(leftover);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'ERROR_CREATE_LEFTOVER' });
    }
  };

  const get = async (req, res) => {
    try {
      const leftover = await Leftover.findOne({ _id: req.params._id }).exec();

      if (!leftover) {
        return res.status(404).send({ message: 'LEFTOVER_NOT_FOUND' });
      }

      res.status(200).send(leftover);
    } catch (err) {
      res.status(500).send({ message: 'ERROR_GET_LEFTOVER' });
    }
  };

  const update = async (req, res) => {
    try {
      const leftover = await Leftover.findOneAndUpdate({ _id: req.params._id }, req.body, {
        new: true,
        upsert: true,
      }).exec();

      if (!leftover) {
        return res.status(404).send({ message: 'LEFTOVER_NOT_FOUND' });
      }

      res.status(200).send(leftover);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'ERROR_UPDATING_LEFTOVER' });
    }
  };

  const deleteLeftover = async (req, res) => {
    try {
      const leftover = await Leftover.findOneAndDelete({ _id: req.params._id });

      if (!leftover) {
        return res.status(404).send({ message: 'ERROR_DELETING_LEFTOVER' });
      }
      
      res.status(200).send(leftover);
    } catch (err) {
      res.status(500).send({ message: 'ERROR_DELETE_LEFTOVER' });
    }
  };

  return {
    read,
    create,
    get,
    update,
    delete: deleteLeftover,
  };
};
export default controllerFactory;
