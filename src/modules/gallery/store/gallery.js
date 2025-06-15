import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';

const gallery = new Store(`${process.env.API_URL}/api/gallery`);

export default gallery;
