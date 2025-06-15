// Dependencies
import axios from 'axios';

// Vue modules
import { reactive, watch } from 'vue';

// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

// Setup Axios
const $axios = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});

// State
const state = reactive({
  memberships: [],
  error: null,
});

// Methods
const actions = {
  async read(options = {}) {
    try {
      const response = await $axios.get(`/api/memberships`, { params: options });
      state.error = null;
      state.memberships = response.data;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async create(membership) {
    try {
      const response = await $axios.post(`/api/memberships/create`, membership);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async update(membership) {
    try {
      const response = await $axios.post(`/api/memberships/update`, membership);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async delete(membership) {
    try {
      const response = await $axios.post(`/api/memberships/delete`, membership);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
};

const mutations = {
  handleMembershipUpdate(data, membership, status, target, statusName, statusNumber) {
    let entity;

    console.log('public is', data);
    console.log('isArray', Array.isArray(data));

    if (Array.isArray(data)) {
      // Если data - это массив, ищем в нем сущность
      entity = data.find(o => o._id === membership.target);
    } else if (typeof data === 'object' && data._id === membership.target) {
      // Если data - это объект и он соответствует целевой сущности, присваиваем его
      entity = data;
    }

    if (entity) {
      entity[statusName] = status;

      if (status) {
        entity.memberships.push(membership);
        entity[statusNumber] += 1;
      } else {
        const index = entity.memberships.findIndex(m => m._id === membership._id);

        if (index !== -1) {
          entity.memberships.splice(index, 1);
          entity[statusNumber] -= 1;
        }
      }
    }
  },
};

// History
const history = [];
history.push(state);

// Watch
watch(state, newState => {
  history.push(newState);
});

// Module Export
export { actions, mutations, state };
