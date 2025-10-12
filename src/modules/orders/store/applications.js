import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const applications = new Store(`${process.env.API_URL}/api/applications`);

export default applications;