// leftovers.js - Updated store
import { reactive, watch } from 'vue';
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

const state = reactive({
  all: [],
  current: {
    storage: null,
    type: '',
    comment: null,
    order: null,
    positions: [],
  },
  settings: {
    columnVisibility: {
      product: true,
      sku: true,
      category: true,
      supplier: true,
      stock: true,
      price: true
    },
    sortBy: 'available',
    sortDirection: 'asc'
  }
});

const actions = {
  // Using existing methods as instructed
  async read(options) {
    try {
      const response = await $axios.get('/leftovers', { params: options });
      state.all = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async fetch(_id) {
    try {
      const response = await $axios.get('/leftovers/' + _id);
      state.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async create({ organization, type, order, positions, creator, owner, comment }) {
    try {
      const response = await $axios.post('/leftovers', {
        organization,
        type,
        order,
        positions,
        creator,
        owner,
        comment,
      });
      state.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async update(leftover) {
    try {
      const response = await $axios.post('/leftovers/' + leftover._id, leftover);
      state.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async delete(_id) {
    try {
      const response = await $axios.delete('/leftovers/' + _id);
      state.all.splice(
        state.all.findIndex(l => l._id == _id),
        1
      );
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }
};

const mutations = {
  resetStock() {
    state.current = {
      storage: null,
      type: '',
      comment: null,
      order: null,
      positions: [],
    };
  },
  
  updateColumnSettings(settings) {
    state.settings.columnVisibility = { ...state.settings.columnVisibility, ...settings };
  }
};

const history = [];
history.push(state);

watch(state, newState => {
  history.push(newState);
});

export { actions, mutations, state };