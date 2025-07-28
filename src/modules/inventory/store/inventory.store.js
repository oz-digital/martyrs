import { reactive, watch } from 'vue';
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

const state = reactive({
  adjustments: [],
  availability: [],
  inventories: [],
  current: {
    storage: null,
    positions: [],
    comment: '',
    status: 'draft'
  },
  filters: {
    storage: null,
    product: null,
    dateStart: null,
    dateEnd: null
  }
});

const actions = {
  // Adjustments
  async fetchAdjustments(options = {}) {
    try {
      const params = { ...state.filters, ...options };
      const response = await $axios.get('/api/inventory/adjustments', { params });
      state.adjustments = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async createAdjustment(data) {
    try {
      const response = await $axios.post('/api/inventory/adjustments/create', data);
      state.adjustments.unshift(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  // Availability
  async fetchAvailability(options = {}) {
    try {
      const response = await $axios.get('/api/inventory/availability', { params: options });
      state.availability = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  // Inventory audits
  async fetchInventories(options = {}) {
    try {
      const response = await $axios.get('/api/inventory/audits', { params: options });
      state.inventories = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async createInventory(data) {
    try {
      const response = await $axios.post('/api/inventory/audits/create', data);
      state.inventories.unshift(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  
  async completeInventory(id) {
    try {
      const response = await $axios.post('/api/inventory/audits/complete', { _id: id });
      const index = state.inventories.findIndex(i => i._id === id);
      if (index > -1) state.inventories[index] = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  }
};

const mutations = {
  resetCurrent() {
    state.current = {
      storage: null,
      positions: [],
      comment: '',
      status: 'draft'
    };
  },
  
  setFilters(filters) {
    state.filters = { ...state.filters, ...filters };
  },
  
  addPosition(position) {
    state.current.positions.push(position);
  },
  
  removePosition(index) {
    state.current.positions.splice(index, 1);
  }
};

export { state, actions, mutations };