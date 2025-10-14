import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';

const gallery = new StoreManager(`${process.env.API_URL}/api/gallery`);

export default gallery;
