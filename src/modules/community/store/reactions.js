// Vue modules
import { reactive, watch } from 'vue';

// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';

// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';

// State
const state = reactive({
  reactions: [],
  error: null,
});

// Methods
const actions = {
  async read(options) {
    try {
      // Initialize an empty params object
      const params = {};

      // Add properties to params if they exist in options
      if (options.user) {
        params.user = options.user;
      }
      if (options.type) {
        params.type = options.type;
      }
      if (options.target) {
        params.target = options.target;
      }
      if (options.targetString) {
        params.targetString = options.targetString;
      }

      // Sending the request with the params object
      const response = await $axios.get(`/api/reactions/read`, { params });
      state.error = null;
      state.reactions = response.data;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async create(reaction) {
    try {
      const response = await $axios.post(`/api/reactions/create`, reaction);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      console.log(error);
      setError(error);
      return Promise.reject(error);
    }
  },
  async update(reaction) {
    try {
      const response = await $axios.post(`/api/reactions/update`, reaction);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  async delete(reaction) {
    try {
      const response = await $axios.post(`/api/reactions/delete`, reaction);
      state.error = null;
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
};

const mutations = {
  handleReactionUpdate(data, reaction, hasReaction) {
    let entity;

    if (Array.isArray(data)) {
      entity = data.find(o => o._id === reaction.target);
    } else if (typeof data === 'object' && data._id === reaction.target) {
      entity = data;
    }

    if (entity) {
      entity.hasReaction = hasReaction;

      if (hasReaction) {
        entity.reactions.push(reaction);
        entity.numberOfReactions += 1;
      } else {
        const index = entity.reactions.findIndex(t => t._id === reaction._id);
        if (index !== -1) {
          entity.reactions.splice(index, 1);
          entity.numberOfReactions -= 1;
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
