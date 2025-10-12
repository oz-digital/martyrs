import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import path from 'path';
// --------------------------------------------------
// METHODS
// --------------------------------------------------
const controllerFactory = db => {
  const Photo = db.photo;
  const read = async (req, res) => {
    let stages = [
      ...queryProcessorCore.getBasicOptions(req.query),
      // Date Filter
      ...queryProcessorCore.getFilterDate(req.query.dateStart, req.query.dateEnd),
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
      const photos = await Photo.aggregate(stages);
      if (!photos) {
        return res.status(404).send({ errorCode: 'PHOTOS_NOT_FOUND', message: 'Photos not found.' });
      }
      res.status(200).send(photos);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        errorCode: 'GET_PHOTOS_FAILED',
        message: 'Error occurred while fetching photos.',
        error: err,
      });
    }
  };
  const create = async (req, res) => {
    try {
      const { tags, creator, owner, status, images } = req.body;
      if (!creator || !owner || !images || images.length === 0) {
        return res.status(400).send({ message: 'All fields are required.' });
      }
      const photos = [];
      for (let image of images) {
        const filename = path.basename(image);
        const directory = path.dirname(image);
        const newPhoto = {
          tags,
          creator,
          owner,
          image,
          status,
          cover: path.join(directory, 'thumbnail_' + filename), // создаем путь для миниатюры
        };
        let photo = await Photo.create(newPhoto);
        if (!photo) {
          return res.status(404).send({ message: `Photo with link ${image} is not created.` });
        }
        photo = await Photo.findOne({ _id: photo._id }).populate('creator.target').populate('owner.target');
        photos.push(photo);
      }
      res.status(200).send(photos);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error });
    }
  };
  const update = async (req, res) => {
    try {
      const updatedPhoto = await Photo.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      })
        .populate('creator.target')
        .populate('owner.target');
      if (!updatedPhoto) {
        return res.status(404).send({ message: 'Something went wrong when updating photo.' });
      }
      res.status(200).send(updatedPhoto);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  };
  const deletePhoto = async (req, res) => {
    try {
      const deletedPhoto = await Photo.findOneAndDelete({ _id: req.body._id }).populate('creator.target').populate('owner.target');
      if (!deletedPhoto) {
        return res.status(404).send({ message: 'Photo is not deleted.' });
      }
      res.status(200).send(deletedPhoto);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  };
  return {
    read,
    create,
    update,
    delete: deletePhoto,
  };
};
export default controllerFactory;
