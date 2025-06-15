const customerInitState = {
  _id: null,
  identity: {
    type: 'Visitor',
    target: null,
  },
  owner: {
    type: 'Organization',
    target: null,
  },
  creator: {
    type: 'User',
    target: null,
  },
  user: null,
  profile: {
    name: null,
  },
  messenger: {
    type: null,
  },
  socials: {
    instagram: null,
    telegram: null,
    whatsapp: null,
  },
};

export default customerInitState;
