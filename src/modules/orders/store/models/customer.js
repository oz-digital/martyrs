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
    description: null,
    photo: null,
  },
  email: null,
  phone: null,
  source: 'web',
  referral: {
    code: null,
    source: null,
  },
  tags: [],
  notes: null,
  status: 'active',
  messenger: {
    type: null,
  },
  socials: {
    instagram: null,
    telegram: null,
    whatsapp: null,
  },
  address: {
    country: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    postalCode: null,
  },
};

export default customerInitState;
