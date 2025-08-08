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
    photo: '',
    name: '',
    slug: '',
    url: '',
    level: 0,
    status: 'draft',
    creator: null,
    owner: null,
    parent: null,
    children: [],
    filters: [],
    translations: [],
  },
});

// Methods
const actions = {
  async read(options = {}) {
    try {
      const response = await $axios.get('/api/categories', { params: options });

      if (options._id) {
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
  async updateOrder(data) {
    try {
      const response = await $axios.post('/api/categories/updateOrder', data);

      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async delete(id) {
    try {
      await $axios.post('/api/categories/delete', { _id: id });
      // Рекурсивная функция для удаления категории и её детей из дерева
      function removeFromTree(items) {
        return items.filter(item => {
          if (item._id === id) {
            return false;
          }
          if (item.children && item.children.length > 0) {
            item.children = removeFromTree(item.children);
          }
          return true;
        });
      }
      state.all = removeFromTree(state.all);
      return Promise.resolve();
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  clean() {
    state.current = {
      order: 1,
      photo: '',
      name: '',
      slug: '',
      url: '',
      level: 0,
      status: 'draft',
      creator: null,
      owner: null,
      parent: null,
      children: [],
      filters: [],
      translations: [],
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
