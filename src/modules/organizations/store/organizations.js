// Vue modules
import { reactive } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// Setup Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// State
const state = reactive({
  all: [],
  current: {
    _id: null,
    profile: {
      tags: [],
      photo: '',
      name: '',
      description: '',
    },
    structure: [],
    owner: null,
    types: '',
    contacts: {
      email: '',
      website: '',
      phone: '',
      address: '',
    },
    socials: {
      telegram: '',
      line: '',
      facebook: '',
      instagram: '',
      youtube: '',
    },
    rating: {
      popularity: 0,
      median: 0,
      amount: 0,
    },
  },
});

const actions = {
  // Create
  async create(organization, owner) {
    organization.owner = owner;
    try {
      const response = await $axios.post('/api/organizations/create', organization);
      state.current = response.data;
      return response.data;
    } catch (error) {
      console.log(error);
      setError(error);
      throw error;
    }
  },
  async read(options = {}) {
    console.log(options);

    try {
      const response = await $axios.get('/api/organizations', { params: options });

      if (options._id) {
        Object.assign(state.current || {}, response.data[0]);
      } else {
        // state.all = [...state.all, ...response.data];
        // state.all = response.data; // Assuming that the response.data is an array of organization objects
      }
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },
  // Update
  async update(_id, updatedData) {
    console.log(_id, updatedData);
    return await $axios.post(`/api/organizations/${_id}/update`, updatedData).then(
      response => {
        console.log('Organization updated successfully');
        return Promise.resolve(response.data);
      },
      error => {
        console.log('Updating organization failed');
        return Promise.reject(error);
      }
    );
  },

  // Remove
  async remove(organizationId) {
    await $axios
      .delete(`/api/organizations/${organizationId}/delete`)
      .then(
        response => {
          state.error = null;
          return Promise.resolve(response.data);
        },
        error => {
          setError(error);
          return Promise.reject(error);
        }
      )
      .catch(error => {
        setError(error);
      });
  },
  // Reset
  async reset() {
    state.current = {
      _id: null,
      profile: {
        categories: [],
        photo: '',
        name: '',
        description: '',
      },
      structure: [],
      owner: null,
      types: '',
      contacts: {
        email: '',
        website: '',
        phone: '',
        address: '',
      },
      socials: {
        telegram: '',
        line: '',
        facebook: '',
        instagram: '',
      },
      rating: {
        popularity: 0,
        median: 0,
        amount: 0,
      },
    };
  },
};

// const history = []
// history.push(state)

// // // Watch
// watch(state, (newState, oldState) => {
//   history.push(newState)
// })

// Module Export
export { actions, state };
