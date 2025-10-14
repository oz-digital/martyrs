import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';

const applications = new StoreManager(`${process.env.API_URL}/api/applications`);

export default applications;