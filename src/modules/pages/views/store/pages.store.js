import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const pages = new Store(`${process.env.API_URL}/api/pages`);

export default pages;
