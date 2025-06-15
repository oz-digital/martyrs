import customerInitState from '@martyrs/src/modules/orders/store/models/customer.js';

const orderInitState = {
  _id: undefined,
  positions: [],
  status: null,
  comment: '',

  owner: {
    type: 'Organization',
    target: null,
  },

  creator: {
    type: 'Customer',
    target: null,
  },

  customer: { ...customerInitState },

  payment: {
    type: null,
    status: null,
  },

  delivery: {
    type: null,
    address: null,
    spot: null,
    status: '',
  },
};

export default orderInitState;
