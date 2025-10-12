import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
import { reactive, watch } from 'vue';

import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';

const state = reactive({
  all: [],
  current: {
    name: '',
    localization: [],
    groups: [],
    url: '',
    content: [],
  },
});

const actions = {
  async create(page) {
    try {
      const response = await $axios.post(`/api/pages/create`, page);

      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async read(options = {}) {
    try {
      const response = await $axios.get('/api/pages/read', { params: options });

      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async update(page) {
    try {
      const response = await $axios.put(`/api/pages/update`, page);

      state.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async delete(page) {
    try {
      const response = await $axios.delete(`/api/pages/delete`, {
        data: page,
      });

      state.all.splice(
        state.all.findIndex(p => p._id == page),
        1
      );
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const history = [];
history.push(state);

watch(state, newState => {
  history.push(newState);
});

export { actions, state };
