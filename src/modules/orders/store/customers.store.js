import Store from '@martyrs/src/modules/core/views/classes/core.store.js';

const customers = new Store(`${process.env.API_URL}/api/customers`);

export default customers;
