import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';

const applications = new Store(`${process.env.API_URL}/api/applications`);

export default applications;