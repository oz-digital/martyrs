import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';

const pages = new StoreManager(`${process.env.API_URL}/api/pages`);

export default pages;
