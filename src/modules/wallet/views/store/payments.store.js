import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
import axios from 'axios';
import { reactive, watch } from 'vue';

const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true });

const state = reactive({
  current: {
    Status: '',
  },
  data: {},
});

const actions = {
  async read() {
    try {
      const response = await $axios.get(`/api/payments`);
      state.data = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async create(payment) {
    try {
      const response = await $axios.post(`/api/payments`, payment);
      state.data[response.data._id] = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async update(payment) {
    try {
      const response = await $axios.post(`/api/payments`, payment);
      state.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async delete(_id) {
    try {
      const response = await $axios.delete(`/api/payments`);
      delete state.data[_id];
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
