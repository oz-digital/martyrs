// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
// State
const state = reactive({
  spots: [],
  spot: {
    status: 'unpublished',
    organization: '',

    profile: {
      photo: '',
      name: '',
      description: '',
      categories: [],
    },
    position: {
      address: undefined,
      location: undefined,
      hide: false,
    },

    address: undefined,
    location: undefined,

    worktime: {
      regular: [],
      special: [],
    },
    delivery: [],
    payment: [],
    members: [],
    subspots: [],
  },
  error: null,
});

// Methods
const actions = {
  async readOne(spotID) {
    try {
      const response = await $axios.get(`/api/spots/get/${spotID}`);

      state.spot = response.data;
    } catch (error) {
      setError(error);
    }
  },
  async read(options) {
    try {
      const response = await $axios.get(`/api/spots`, { params: options });
      state.spots = response.data;
      return response.data;
    } catch (error) {
      setError(error);
    }
  },

  async create(organizationId, spot) {
    try {
      const response = await $axios.post(`/api/spots/${organizationId}/create`, spot);

      state.spot = response.data;
    } catch (error) {
      setError(error);
    }
  },
  async update(organizationId, spot) {
    try {
      await $axios.post(`/api/spots/${organizationId}/update`, spot);
    } catch (error) {
      setError(error);
    }
  },
  async delete(organizationId, spotId) {
    try {
      await $axios.delete(`/api/spots/${organizationId}/delete`, { data: { _id: spotId } });
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
