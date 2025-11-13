import { reactive, watch } from 'vue';
import StoreManager from '@martyrs/src/modules/core/views/classes/store.manager.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { returnCurrency } = useGlobalMixins();

// State
const state = reactive({
  shops: [],
  popular: [],
  pagination: {
    page: 1,
    perPage: 18,
  },
  search: {
    active: false,
    current: '',
    result: [],
  },
  locationOptions: [
    { label: 'All', path: '/marketplace' },
    { label: 'Phuket', path: '/marketplace/thailand/phuket' },
    { label: 'Bangkok', path: '/marketplace/thailand/bangkok' },
    { label: 'Chiang Mai', path: '/marketplace/thailand/chiang-mai' },
    { label: 'Pattaya', path: '/marketplace/thailand/pattaya' },
  ],
  filter: {
    active: false,
    class: 'mobile-only',
    selected: {},
    options: [
      {
        title: 'Price',
        value: 'price',
        type: 'range',
        minPlaceholder: 'From',
        maxPlaceholder: 'To',
        label: returnCurrency()
      },
      {
        title: 'Delivery',
        value: 'delivery',
        type: 'checkbox',
        options: [
          { label: 'Pickup', value: 'pickup' },
          { label: 'Delivery', value: 'courier' },
          { label: 'Mail', value: 'post' },
        ],
      },
      {
        title: 'Payment',
        value: 'payment',
        type: 'checkbox',
        options: [
          { label: 'Cash', value: 'cash' },
          { label: 'Card', value: 'card' },
          { label: 'Crypto', value: 'crypto' },
          { label: 'Bank Transfer', value: 'bank' },
        ],
      },
    ],
  },
  sort: {
    param: 'distance',
    order: 'asc',
    options: [
      {
        label: 'Distance',
        value: 'distance',
      },
      {
        label: 'Popularity',
        value: 'views',
      },
      {
        label: 'Products',
        value: 'numberOfProducts',
      },
    ],
  },
});

// History
const history = [];
history.push(state);

// Watch
watch(state, (newState, oldState) => {
  history.push(newState);
});

// Actions через StoreManager
const marketplaceStore = new StoreManager('/api/marketplace');

// Custom action для каталога
marketplaceStore.readCatalog = async function(params = {}) {
  console.log('Reading marketplace catalog with params:', params);
  try {
    const result = await this.request('/catalog', { params });
    console.log(`Catalog returned ${result.length || 0} items`);

    // Обновляем state.shops если нужно
    if (result && Array.isArray(result)) {
      state.shops = result;
    }

    return result;
  } catch (error) {
    console.error('Catalog read failed:', error);
    throw error;
  }
};

// Module Export
export { state, marketplaceStore };

export default marketplaceStore;
