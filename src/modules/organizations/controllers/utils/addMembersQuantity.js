const addMembersQuantity = user => {
  return {
    $addFields: {
      numberOfSubscribers: {
        $size: {
          $filter: {
            input: '$memberships',
            as: 'membership',
            cond: { $eq: ['$$membership.role', 'subscriber'] },
          },
        },
      },
      numberOfMembers: {
        $size: {
          $filter: {
            input: '$memberships',
            as: 'membership',
            cond: { $not: { $in: ['$$membership.role', ['blocked', 'subscriber']] } },
          },
        },
      },
    },
  };
};

export default addMembersQuantity;
