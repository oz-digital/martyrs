import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
async function getBlockedMembers(Membership, userId) {
  const memberships = await Membership.find({ user: userId });
  return memberships.filter(membership => membership.role === 'blocked').map(membership => membership.target);
}
function addConditionsForBlocked(matchStage, field, blockedMembers) {
  const conditionsForBlocked = { $nin: blockedMembers };
  if (matchStage[field]) {
    matchStage[field] = { $eq: matchStage[field], ...conditionsForBlocked };
  } else {
    matchStage[field] = conditionsForBlocked;
  }
  return matchStage;
}
const AggregationProcessor = {
  getMembersByRole: async (Membership, userId, role) => {
    const memberships = await Membership.find({ user: userId, role: role });
    return memberships.map(membership => new ObjectId(membership.target));
  },
  generateMatchStage: async (Membership, userOrFollowing, role, operation = '$in') => {
    if (!userOrFollowing) {
      return [];
    }
    const members = await AggregationProcessor.getMembersByRole(Membership, userOrFollowing, role);
    if (members.length === 0) {
      return [];
    }
    const typeMap = {
      'owner.target': 'organization',
      'creator.target': 'user',
    };
    const matchConditions = Object.keys(typeMap).map(key => ({
      [key]: { [operation]: members },
    }));
    return [
      {
        $match: { $or: matchConditions },
      },
    ];
  },
  getBlockedStage: async (Membership, user) => {
    if (user) {
      let matchStage = {};
      const blockedMembers = await getBlockedMembers(Membership, user);
      console.log(blockedMembers);
      if (blockedMembers.length > 0) {
        let stage = {};
        addConditionsForBlocked(stage, 'owner.target', blockedMembers);
        addConditionsForBlocked(stage, 'creator.target', blockedMembers);
        console.log(
          'Maths is' +
            [
              {
                $match: stage,
              },
            ]
        );
        return [
          {
            $match: stage,
          },
        ];
      } else {
        return [];
      }
    } else {
      return [];
    }
  },
  getFollowingStage: async (Membership, following) => {
    // We use $in to match the members the user is following
    return await AggregationProcessor.generateMatchStage(Membership, following, 'subscriber', '$in');
  },
};
export default AggregationProcessor;
