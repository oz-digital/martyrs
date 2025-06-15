import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';

const customers = new Store(`${process.env.API_URL}/api/customers`);

export default customers;
