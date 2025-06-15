import queryProcessorReactions from '@martyrs/src/modules/community/controllers/utils/queryProcessorReactions.js';
import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
import queryProcessorOrganizations from '@martyrs/src/modules/organizations/controllers/utils/queryProcessor.js';
import queryProcessor from './utils/queryProcessor.js';
const controllerFactory = db => {
  const Blogpost = db.blogpost;
  const Organization = db.organization;
  const Membership = db.membership;
  const read = async (req, res) => {
    console.log(req.query);
    let stages = [];
    stages = [
      // Basic
      ...queryProcessorGlobals.getBasicOptions(req.query),
      ...queryProcessorGlobals.getTagsOptions(req.query.tags),
      ...queryProcessor.getPeriodConditions(req.query.period),
      ...(await queryProcessor.getCategoryConditions(req.query.category)),
      // Following
      ...(await queryProcessorOrganizations.getFollowingStage(Membership, req.query.following)),
      // Blocking
      ...(await queryProcessorOrganizations.getBlockedStage(Membership, req.query.user)),
      queryProcessorReactions.getCommentsLookupStage(),
      queryProcessorReactions.getReactionsLookupStage(),
      queryProcessorReactions.getReactionsCommentsFields(req.query.user),
      queryProcessorGlobals.getCreatorUserLookupStage(),
      queryProcessorGlobals.getCreatorOrganizationLookupStage(),
      // For owner
      queryProcessorGlobals.getOwnerUserLookupStage(),
      queryProcessorGlobals.getOwnerOrganizationLookupStage(),
      queryProcessorGlobals.getAddFieldsCreatorOwnerStage(),
      // Sorting and Pagination
      ...queryProcessorGlobals.getSortingOptions(req.query.sortParam, req.query.sortOrder),
      ...queryProcessorGlobals.getPaginationOptions(req.query.skip, req.query.limit),
      // For creator
      // { $sample: { size: Number(req.query.limit) } },
    ];
    try {
      const posts = await Blogpost.aggregate(stages).exec();
      if (posts.length === 0) {
        return res.status(200).send([]);
      }
      res.status(200).send(posts);
    } catch (err) {
      console.log(err);
      res.status(500).send({ err });
    }
  };
  const create = (req, res) => {
    const newBlogpost = {
      url: req.body.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''),
      name: req.body.name,
      status: req.body.status,
      tags: req.body.tags ? req.body.tags : ['All'],
      owner: req.body.owner,
      source: req.body.source,
      creator: req.body.creator,
      content: req.body.content,
      views: 1,
    };
    Blogpost.create(newBlogpost)
      .then(post => {
        res.status(200).send(post);
      })
      .catch(err => {
        res.status(500).send({ message: err.message || 'Some error occurred while creating the blogpost.' });
      });
  };
  const update = (req, res) => {
    Blogpost.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true })
      .exec()
      .then(post => {
        if (!post) {
          return res.status(404).send({ message: 'Something wrong when updating the blogpost.' });
        }
        res.status(200).send(post);
      })
      .catch(err => {
        res.status(500).send({ message: err.message || 'Some error occurred while updating the blogpost.' });
      });
  };
  const del = (req, res) => {
    Blogpost.findOneAndDelete({ _id: req.params._id })
      .exec()
      .then(post => {
        if (!post) {
          return res.status(404).send({ message: 'The blogpost is not deleted.' });
        }
        res.status(200).send(post);
      })
      .catch(err => {
        res.status(500).send({ message: err.message || 'Some error occurred while deleting the blogpost.' });
      });
  };
  return {
    read,
    create,
    update,
    delete: del,
  };
};
export default controllerFactory;
