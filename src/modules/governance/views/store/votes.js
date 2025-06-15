import { reactive, watch } from 'vue';

import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

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
      const response = await $axios.get('/api/votings');
      votingsState.all = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getVotingById(id) {
    try {
      const response = await $axios.get(`/api/votings/${id}`);
      votingsState.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async createVoting(voting) {
    try {
      const response = await $axios.post('/api/votings', voting);
      votingsState.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async updateVoting(voting) {
    try {
      const response = await $axios.put(`/api/votings/${voting.id}`, voting);
      const index = votingsState.all.findIndex(v => v.id === voting.id);
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
      await $axios.delete(`/api/votings/${id}`);
      votingsState.all = votingsState.all.filter(v => v.id !== id);
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
