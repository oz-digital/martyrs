import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';

const stockAlertsStore = new StoreManager('/api/inventory/alerts');

export default stockAlertsStore;