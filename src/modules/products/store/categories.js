// Dependencies
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
import { reactive, watch } from 'vue';

import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

// State
const state = reactive({
  all: [],

  filter: {
    status: null,
    search: null,
  },
  current: {
    order: 1,
    photo: null,
    name: '',
    url: '',
    status: 'draft',
    creator: null,
    owner: null,
    parent: null,
    children: [],
    filters: [],
    localization: [],
  },
});

// Methods
const actions = {
  async read(options = {}) {
    try {
      const response = await $axios.get('/api/categories', { params: options });

      if (options.url) {
        state.current = { ...response.data[0] };
        return Promise.resolve(response.data[0]);
      } else {
        return Promise.resolve(response.data);
      }
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async create(category) {
    try {
      const response = await $axios.post('/api/categories/create', category);
      state.all.push(response.data);
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async update(category) {
    try {
      const response = await $axios.post('/api/categories/update', category);
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  // Method for updating order of multiple categories
  async updateOrder(categories) {
    try {
      const response = await $axios.post('/api/categories/updateOrder', {
        categories: categories,
      });

      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async delete(url) {
    try {
      await $axios.post('/api/categories/delete', { url });
      state.all = state.all.filter(c => c.url !== url);
      return Promise.resolve();
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  clean() {
    state.current = {
      order: 1,
      name: '',
      url: '',
      status: 'draft',
      parent: null,
      children: [],
      filters: [],
      localization: [],
    };
  },
};

const history = [];
history.push(state);

watch(
  state,
  newState => {
    history.push(newState);
  },
  { deep: true }
);

export { actions, state };
