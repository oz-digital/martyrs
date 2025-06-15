// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// Setup Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// State
const state = reactive({
  departments: [],
  department: {
    organization: '',
    profile: {
      photo: '',
      name: '',
      description: '',
      categories: [],
    },
    address: '',
    location: {
      lat: null,
      lng: null,
    },
    worktime: [],
    delivery: [],
    payment: [],
    members: [],
    subdepartments: [],

    // Accesses
    hidden: false,
    accesses: {
      events: {
        read: false,
        edit: false,
        delete: false,
      },
      gallery: {
        read: false,
        edit: false,
        delete: false,
      },
      products: {
        read: false,
        edit: false,
        delete: false,
      },
      orders: {
        read: false,
        confirm: false, // This property was added based on the schema
        delete: false,
      },
      departments: {
        read: false,
        edit: false,
        delete: false,
      },
    },
  },
  error: null,
});

// Methods
const actions = {
  async readOne(departmentID) {
    try {
      const response = await $axios.get(`/api/departments/get/${departmentID}`);
      state.department = response.data;
      state.error = null;
      return response.data; // Return the response data
    } catch (error) {
      setError(error);
      return null; // Return null or appropriate error response
    }
  },

  async read(options = {}) {
    try {
      const response = await $axios.get(`/api/departments/read`, { params: options });

      console.log('Response:', response);
      state.departments = response.data;
      state.error = null;
      return response.data; // Return the response data
    } catch (error) {
      console.log(error);
      setError(error);
      return null; // Return null or appropriate error response
    }
  },

  async create(organizationId, department) {
    try {
      const response = await $axios.post(`/api/departments/${organizationId}/create`, department);
      state.error = null;
      return response.data; // Return the response data
    } catch (error) {
      setError(error);
      return null; // Return null or appropriate error response
    }
  },

  async update(organizationId, department) {
    try {
      const response = await $axios.post(`/api/departments/${organizationId}/update`, department);
      state.error = null;
      return response; // Return the response for update operations, might not have body data
    } catch (error) {
      setError(error);
      return null; // Return null or appropriate error response
    }
  },

  async delete(organizationId, departmentId) {
    try {
      await $axios.delete(`/api/departments/${organizationId}/delete`, {
        data: { _id: departmentId },
      });
      state.error = null;
      return true; // Return true to indicate successful deletion
    } catch (error) {
      setError(error);
      return false; // Return false or appropriate error response
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
