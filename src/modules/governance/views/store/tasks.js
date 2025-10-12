import { reactive, watch } from 'vue';

import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';

import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';

const tasksState = reactive({
  all: [],
  current: {
    name: '',
    description: '',
    status: '',
    assignedTo: '',
    createdBy: '',
    createdAt: null,
    updatedAt: null,
  },
});

const tasksActions = {
  async getAllTasks() {
    try {
      const response = await $axios.get('/api/tasks/read');
      tasksState.all = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async getTaskById(id) {
    try {
      const response = await $axios.get('/api/tasks/read', { params: { _id: id } });
      tasksState.current = response.data;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async createTask(task) {
    try {
      const response = await $axios.post('/api/tasks/create', task);
      tasksState.all.push(response.data);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async updateTask(task) {
    try {
      const response = await $axios.put('/api/tasks/update', {
        _id: task._id || task.id,
        ...task
      });
      const index = tasksState.all.findIndex(t => (t._id || t.id) === (task._id || task.id));
      if (index !== -1) {
        tasksState.all[index] = response.data;
      }
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async deleteTask(id) {
    try {
      await $axios.post('/api/tasks/delete', { _id: id });
      tasksState.all = tasksState.all.filter(t => (t._id || t.id) !== id);
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async assignTask(id, userId) {
    try {
      const response = await $axios.post(`/api/tasks/${id}/assign`, { userId });
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
  async completeTask(id) {
    try {
      const response = await $axios.post(`/api/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const tasksHistory = [];

watch(tasksState, newState => {
  tasksHistory.push(JSON.parse(JSON.stringify(newState)));
});

export { tasksActions, tasksState };
