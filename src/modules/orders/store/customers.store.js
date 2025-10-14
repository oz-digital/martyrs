import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';

const customers = new StoreManager(`${process.env.API_URL}/api/customers`);

export default customers;
