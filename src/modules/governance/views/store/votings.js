import { reactive, watch } from 'vue';

import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

// Votes Store
const votesState = reactive({
  all: [],
  current: {
    votingId: '',
    userId: '',
    choice: '',
    createdAt: null,
  },
});

const votesActions = {
  async castVote(votingId, vote) {
    try {
      const response = await $axios.post(`/api/votings/${votingId}/vote`, vote);
      votesState.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getVotesForVoting(votingId) {
    try {
      const response = await $axios.get('/api/votes/read', { params: { voting: votingId } });
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getUserVotes(userId) {
    try {
      const response = await $axios.get('/api/votes/read', { params: { voter: userId } });
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async updateVote(id, vote) {
    try {
      const response = await $axios.put('/api/votes/update', {
        _id: id,
        ...vote
      });
      const index = votesState.all.findIndex(v => (v._id || v.id) === id);
      if (index !== -1) {
        votesState.all[index] = response.data;
      }
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async deleteVote(id) {
    try {
      await $axios.post('/api/votes/delete', { _id: id });
      votesState.all = votesState.all.filter(v => (v._id || v.id) !== id);
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const votesHistory = [];

watch(votesState, newState => {
  votesHistory.push(JSON.parse(JSON.stringify(newState)));
});

export { votesActions, votesState };
