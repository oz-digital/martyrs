const applicationInitState = {
  _id: null,
  status: 'created',
  type: 'newsletter',
  contacts: {
    name: null,
    email: null,
    phone: null,
  },
  text: null,
  chat: null,
  customer: {
    type: 'Customer',
    target: null,
  },
};

export default applicationInitState;