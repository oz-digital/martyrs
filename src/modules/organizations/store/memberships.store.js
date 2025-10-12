import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const membershipsStore = new Store('/api/memberships');

// Add handleMembershipUpdate method
membershipsStore.handleMembershipUpdate = function(user, membership, status, target, statusName, statusNumber) {
  if (!user) return;
  
  // status comes as boolean from ButtonToggleMembership
  if (status === true || status === 'active') {
    user[statusName] = true;
    if (statusNumber) {
      user[statusNumber] = (user[statusNumber] || 0) + 1;
    }
  } else {
    user[statusName] = false;
    if (statusNumber) {
      user[statusNumber] = Math.max((user[statusNumber] || 0) - 1, 0);
    }
  }
};

export default membershipsStore;