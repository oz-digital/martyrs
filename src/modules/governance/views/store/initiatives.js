import { reactive, watch } from 'vue';

import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

// Initiatives Store
const initiativesState = reactive({
  all: [],
  current: {
    name: '',
    description: '',
    status: '',
    createdBy: '',
    createdAt: null,
    updatedAt: null,
  },
});

const initiativesActions = {
  async getAllInitiatives() {
    try {
      const response = await $axios.get('/api/initiatives');
      initiativesState.all = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getInitiativeById(id) {
    try {
      const response = await $axios.get(`/api/initiatives/${id}`);
      initiativesState.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async createInitiative(initiative) {
    try {
      const response = await $axios.post('/api/initiatives', initiative);
      initiativesState.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async updateInitiative(initiative) {
    try {
      const response = await $axios.put(`/api/initiatives/${initiative.id}`, initiative);
      const index = initiativesState.all.findIndex(i => i.id === initiative.id);
      if (index !== -1) {
        initiativesState.all[index] = response.data;
      }
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async deleteInitiative(id) {
    try {
      await $axios.delete(`/api/initiatives/${id}`);
      initiativesState.all = initiativesState.all.filter(i => i.id !== id);
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async approveInitiative(id) {
    try {
      const response = await $axios.post(`/api/initiatives/${id}/approve`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async rejectInitiative(id) {
    try {
      const response = await $axios.post(`/api/initiatives/${id}/reject`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const initiativesHistory = [];

watch(initiativesState, newState => {
  initiativesHistory.push(JSON.parse(JSON.stringify(newState)));
});

export { initiativesActions, initiativesState };
