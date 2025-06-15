const isProd = process.env.NODE_ENV === 'production';
// --------------------------------------------------
// VUE
// --------------------------------------------------
import { computed, reactive, watch } from 'vue';
// --------------------------------------------------
// GLOBALS
// --------------------------------------------------
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// --------------------------------------------------
// AXIOS
// --------------------------------------------------
import axios from 'axios';

const $axios = axios.create({ baseURL: process.env.API_URL });
// --------------------------------------------------
// State
// --------------------------------------------------
const state = reactive({
  all: [],

  current: {
    _id: '',
    status: '',
    name: '',
    email: '',
    chat: '',
    text: '',
  },

  form: {
    status: false,
    data: {
      name: '',
      phone: '',
      chat: '',
      text: '',
    },
  },
});
// --------------------------------------------------
// Async Methods
// --------------------------------------------------
async function fetchAll() {
  return await $axios.get(`/applications`).then(
    response => {
      state.all = response.data;
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function fetch(application) {
  return await $axios.get('/applications/' + application._id).then(
    response => {
      state.current = response.data;
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function create(application) {
  return await $axios.post('/applications', application).then(
    response => {
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function update(application) {
  return await $axios.post('/applications/' + application._id, application).then(
    response => {
      let updatedApplication = state.all.find(a => a._id === response.data._id);
      updatedApplication = response.data;
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function updateStatus(update) {
  let application = {
    status: update.status,
  };

  return await $axios.post('/applications/' + update._id, application).then(
    response => {
      const index = state.all.findIndex(p => p._id === update._id);

      if (index !== -1) {
        state.all[index] = response.data;
      }
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function remove(application) {
  return await $axios.delete('/applications/' + application._id).then(
    response => {
      state.all.splice(
        state.all.findIndex(a => a._id == application._id),
        1
      );
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}
// --------------------------------------------------
// Metgods
// --------------------------------------------------
function toggleForm() {
  state.form.status = !state.form.status;
  state.form.data = {
    name: '',
    email: '',
    chat: '',
    text: '',
  };
}
// --------------------------------------------------
// Getters
// --------------------------------------------------
const getApplications = computed(() => state.all);
// --------------------------------------------------
// History
// --------------------------------------------------
const history = [];

history.push(state);

watch(state, (newState, oldState) => {
  history.push(newState);
});
// --------------------------------------------------
// Export module
// --------------------------------------------------
export { create, fetch, fetchAll, remove, state, toggleForm, update, updateStatus };
