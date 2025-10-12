import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
import { reactive } from 'vue';
// Add import for global error handler
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';

const state = reactive({
  all: [],
  current: {
    _id: '',
    username: '',
    email: '',
    phone: '',
    status: '',
    profile: {
      name: '',
      photo: '',
      description: '',
      birthday: '',
    },
    socials: {
      facebook: '',
      twitter: '',
      instagram: '',
      telegram: '',
    },
    roles: [],
  },
});

const actions = {
  async create(user) {
    try {
      const response = await $axios.post('/api/users', user);
      mutations.set(response.data, 'current');
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error); // Add global error handling
      return Promise.reject(error);
    }
  },

  async read(options = {}) {
    try {
      const response = await $axios.get('/api/users', { params: options });

      if (options._id) {
        mutations.set(response.data[0], 'current');
      } else {
        mutations.set(response.data, 'all');
      }
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error); // Add global error handling
      return Promise.reject(error);
    }
  },

  async update(user) {
    try {
      const response = await $axios.put(`/api/users/${user._id}`, user);
      mutations.set(response.data, 'current');
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error); // Add global error handling
      return Promise.reject(error);
    }
  },

  async delete(user) {
    try {
      await $axios.delete(`/api/users/${user._id}`);
      const index = state.all.findIndex(u => u._id === user._id);
      if (index !== -1) {
        state.all.splice(index, 1);
      }
    } catch (error) {
      setError(error); // Add global error handling
      return Promise.reject(error); // Add Promise.reject for consistency
    }
  },
};

const mutations = {
  set(user, property) {
    state[property] = user;
  },
  clean() {
    state.current = {
      phone: '',
      name: '',
      surname: '',
      birthday: '',
      city: '',
      address: '',
      roles: [],
      orders: [],
    };
  },
};

export { actions, mutations, state };
