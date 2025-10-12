import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
import axios from 'axios';
import { reactive, watch } from 'vue';

const $axios = axios.create({ baseURL: process.env.API_URL });

const state = reactive({
  all: [],
  current: {
    _id: '',
    status: '',
    user: '',
    type: '',
    reason: '',
    target: '',
  },
  form: {
    isOpen: false,
    status: '',
    user: '',
    type: '',
    reason: '',
    target: '',
  },
});

// Действия, относящиеся к асинхронным операциям
const actions = {
  async read() {
    try {
      const response = await $axios.get(`/reports`);
      mutations.setAll(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async create(report) {
    try {
      console.log(report);
      const response = await $axios.post('/reports', report);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async update(report) {
    try {
      const response = await $axios.put('/reports/' + report._id, report);
      mutations.updateReportInAll(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  async remove(report) {
    try {
      const response = await $axios.delete('/reports/' + report._id);
      mutations.removeReportFromAll(report._id);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const mutations = {
  setAll(reports) {
    state.all = reports;
  },

  setCurrent(report) {
    state.current = report;
  },

  updateReportInAll(updatedReport) {
    const index = state.all.findIndex(r => r._id === updatedReport._id);
    if (index !== -1) {
      state.all[index] = updatedReport;
    }
  },

  removeReportFromAll(reportId) {
    const index = state.all.findIndex(r => r._id === reportId);
    if (index !== -1) {
      state.all.splice(index, 1);
    }
  },

  toggleForm() {
    state.form.isOpen = !state.form.isOpen;
    state.form = {
      status: '',
      user: '',
      type: '',
      reason: '',
      target: '',
    };
  },
};

const history = [];

history.push(state);

watch(state, (newState, oldState) => {
  history.push(newState);
});

export { actions, mutations, state };
