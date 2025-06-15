// Dependencies
import axios from 'axios';
// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// State
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
// Setup Axios
const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true });
// State
const state = reactive({
  invites: [],
  invite: null,
  error: null,
});
// Methods
const actions = {
  async read(options) {
    try {
      const response = await $axios.get(`/api/invites/${options.owner}`);
      state.invites = response.data;
      state.error = null;
      return response.data;
    } catch (error) {
      setError(error);
    }
  },
  async readOne(inviteId) {
    try {
      const response = await $axios.get(`/api/invites/get/${inviteId}`);
      state.invite = response.data;
      auth.state.user.phone = response.data.phone;
      auth.state.user.email = response.data.email;
    } catch (error) {
      setError(error);
    }
  },
  async create(invites) {
    try {
      const response = await $axios.post(`/api/invites/create`, invites);
      return Promise.resolve(response.data);
      state.error = null;
    } catch (error) {
      setError(error);
    }
  },
  async update(organizationId, membership) {
    try {
      await $axios.put(`/api/invites/update`, membership);
      state.error = null;
    } catch (error) {
      setError(error);
    }
  },
  async delete(inviteID) {
    try {
      await $axios.delete(`/api/invites/delete/${inviteID}`);
      state.error = null;
    } catch (error) {
      setError(error);
    }
  },
};

// History
const history = [];
history.push(state);

// Watch
watch(state, (newState, oldState) => {
  history.push(newState);
});

// Module Export
export { actions, state };
