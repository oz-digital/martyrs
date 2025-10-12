import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import getIsOpenNowStage from './queries/getIsOpenNowStage.js';
const controllerFactory = db => {
  const Spot = db.spot;
  const read = async (req, res) => {
    let stages = [
      ...queryProcessorCore.getBasicOptions(req.query),
      getIsOpenNowStage(),
      // Tags
      ...queryProcessorCore.getTagsOptions(req.query.tags),
      // For creator
      queryProcessorCore.getCreatorUserLookupStage(),
      queryProcessorCore.getCreatorOrganizationLookupStage(),
      queryProcessorCore.getCreatorCustomerLookupStage(),
      // For owner
      queryProcessorCore.getOwnerUserLookupStage(),
      queryProcessorCore.getOwnerOrganizationLookupStage(),
      queryProcessorCore.getAddFieldsCreatorOwnerStage(),
      queryProcessorCore.removeTempPropeties(),
      // Pagination
      ...queryProcessorCore.getSortingOptions(req.query.sortParam, req.query.sortOrder),
      ...queryProcessorCore.getPaginationOptions(req.query.skip, req.query.limit),
    ];
    try {
      const spots = await Spot.aggregate(stages);
      if (!spots) {
        return res.status(404).send({ errorCode: 'SPOTS_NOT_FOUND', message: 'Spots not found.' });
      }
      res.status(200).send(spots);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        errorCode: 'GET_SPOTS_FAILED',
        message: 'Error occurred while fetching spots.',
        error: err,
      });
    }
  };
  const readOne = (req, res) => {
    Spot.findOne({ _id: req.params._id })
      .then(spot => {
        if (!spot) {
          return res.status(404).send({ message: 'Отдел не найден' });
        }
        res.send(spot);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  const create = async (req, res) => {
    try {
      const newSpot = new Spot({
        ...req.body,
        organization: req.params._id,
      });
      const data = await newSpot.save();
      res.send(data);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  };
  const update = (req, res) => {
    Spot.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })
      .then(spot => {
        if (!spot) {
          return res.status(404).send({ message: 'Spot not found' });
        }
        res.send(spot);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  const deleteSpot = (req, res) => {
    Spot.findOneAndDelete({ _id: req.body._id, organization: req.params._id })
      .then(spot => {
        if (!spot) {
          return res.status(404).send({ message: 'Spot not found' });
        }
        res.send({ message: 'Spot deleted successfully' });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  return {
    read,
    readOne,
    create,
    update,
    delete: deleteSpot,
  };
};
export default controllerFactory;
