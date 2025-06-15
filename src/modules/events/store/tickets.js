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
  tickets: [],
  error: null,
});

// Methods
const actions = {
  async read({ user, type, target, role, skip, limit, search }) {
    try {
      const response = await $axios.get(`/api/tickets`, {
        params: { user, type, target, role, skip, limit, search },
      });
      state.error = null;
      state.tickets = response.data;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async create(ticket) {
    try {
      const response = await $axios.post(`/api/tickets/create`, ticket);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async update(ticket) {
    try {
      const response = await $axios.post(`/api/tickets/update`, ticket);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async delete(ticket) {
    try {
      const response = await $axios.post(`/api/tickets/delete`, ticket);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
};

const mutations = {
  handleTicketUpdate(data, ticket, hasTicket) {
    let entity;

    if (Array.isArray(data)) {
      entity = data.find(o => o._id === ticket.target);
    } else if (typeof data === 'object' && data._id === ticket.target) {
      entity = data;
    }

    if (entity) {
      entity.hasTicket = hasTicket;

      if (hasTicket) {
        entity.tickets.push(ticket);
        entity.numberOfTickets += 1;
      } else {
        const index = entity.tickets.findIndex(t => t._id === ticket._id);
        if (index !== -1) {
          entity.tickets.splice(index, 1);
          entity.numberOfTickets -= 1;
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
