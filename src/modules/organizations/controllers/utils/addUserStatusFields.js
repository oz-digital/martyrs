import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
const addUserStatusFields = user => {
  return {
    $addFields: {
      isSubscriber: {
        $cond: [
          {
            $anyElementTrue: {
              $map: {
                input: '$memberships',
                as: 'membership',
                in: {
                  $and: [{ $eq: ['$$membership.user', new ObjectId(user)] }, { $eq: ['$$membership.role', 'subscriber'] }],
                },
              },
            },
          },
          true,
          false,
        ],
      },
      isMember: {
        $cond: [
          {
            $anyElementTrue: {
              $map: {
                input: '$memberships',
                as: 'membership',
                in: {
                  $and: [{ $eq: ['$$membership.user', new ObjectId(user)] }, { $not: [{ $in: ['$$membership.role', ['subscriber', 'blocked']] }] }],
                },
              },
            },
          },
          true,
          false,
        ],
      },
      isBlocked: {
        $cond: [
          {
            $anyElementTrue: {
              $map: {
                input: '$memberships',
                as: 'membership',
                in: {
                  $and: [{ $eq: ['$$membership.user', new ObjectId(user)] }, { $eq: ['$$membership.role', 'blocked'] }],
                },
              },
            },
          },
          true,
          false,
        ],
      },
    },
  };
};
export default addUserStatusFields;
