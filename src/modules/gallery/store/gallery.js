import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const gallery = new Store(`${process.env.API_URL}/api/gallery`);

export default gallery;
