import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';

const pages = new Store(`${process.env.API_URL}/api/pages`);

export default pages;
