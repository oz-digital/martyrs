import { reactive, watch } from 'vue';

import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';

import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';

// Votings Store
const votingsState = reactive({
  all: [],
  current: {
    title: '',
    description: '',
    status: '',
    startDate: null,
    endDate: null,
    createdBy: '',
    createdAt: null,
    updatedAt: null,
  },
});

const votingsActions = {
  async getAllVotings() {
    try {
      const response = await $axios.get('/api/votings/read');
      votingsState.all = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getVotingById(id) {
    try {
      const response = await $axios.get('/api/votings/read', { params: { _id: id } });
      votingsState.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async createVoting(voting) {
    try {
      const response = await $axios.post('/api/votings/create', voting);
      votingsState.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async updateVoting(voting) {
    try {
      const response = await $axios.put('/api/votings/update', {
        _id: voting._id || voting.id,
        ...voting
      });
      const index = votingsState.all.findIndex(v => (v._id || v.id) === (voting._id || voting.id));
      if (index !== -1) {
        votingsState.all[index] = response.data;
      }
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async deleteVoting(id) {
    try {
      await $axios.post('/api/votings/delete', { _id: id });
      votingsState.all = votingsState.all.filter(v => (v._id || v.id) !== id);
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async startVoting(id) {
    try {
      const response = await $axios.post(`/api/votings/${id}/start`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async endVoting(id) {
    try {
      const response = await $axios.post(`/api/votings/${id}/end`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getVotingResults(id) {
    try {
      const response = await $axios.get(`/api/votings/${id}/results`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const votingsHistory = [];

watch(votingsState, newState => {
  votingsHistory.push(JSON.parse(JSON.stringify(newState)));
});

export { votingsActions, votingsState };
