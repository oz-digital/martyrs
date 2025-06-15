import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
function getCommentsLookupStage() {
  return {
    $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'target',
      as: 'comments',
    },
  };
}
function getReactionsLookupStage() {
  return {
    $lookup: {
      from: 'reactions',
      localField: '_id',
      foreignField: 'target',
      as: 'reactions',
    },
  };
}
function getReactionsCommentsFields(user) {
  return {
    $addFields: {
      numberOfComments: { $size: '$comments' },
      numberOfReactions: { $size: '$reactions' },
      isReacted: {
        $in: [
          new ObjectId(user), // make sure db is accessible or pass as param
          '$reactions.user',
        ],
      },
      reactionId: {
        $let: {
          vars: {
            reactionIndex: {
              $indexOfArray: [
                '$reactions.user',
                new ObjectId(user), // same here for db accessibility
              ],
            },
          },
          in: {
            $cond: [{ $gte: ['$$reactionIndex', 0] }, { $arrayElemAt: ['$reactions._id', '$$reactionIndex'] }, null],
          },
        },
      },
    },
  };
}
export { getCommentsLookupStage, getReactionsCommentsFields, getReactionsLookupStage };
export default {
  getCommentsLookupStage,
  getReactionsLookupStage,
  getReactionsCommentsFields,
};
