// Vue modules
import { reactive } from 'vue';
// Setup Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

/**
 * Реактивное состояние для модуля аренды.
 */
const state = reactive({
  all: [],
  filter: {
    productIds: [],
    startDate: null,
    endDate: null,
  },
  pagination: {
    page: 1,
    perPage: 10,
  },
  sort: {
    current: 'startDate',
    ascending: true,
  },
  current: {
    product: null,
    startDate: null,
    endDate: null,
    status: 'active',
  },
});

const mutations = {
  set(property, data) {
    state[property] = data;
  },
  clean() {
    state.current = {
      product: null,
      startDate: null,
      endDate: null,
      status: 'active',
    };
  },
};

const actions = {
  async read(options = {}) {
    try {
      const response = await $axios.get('/api/rents', { params: options });

      if (options._id) {
        mutations.set('current', response.data);
      } else {
        mutations.set('all', response.data);
      }
      return response.data;
    } catch (err) {
      console.error('Ошибка при чтении аренд:', err);
      setError(err);
      throw err;
    }
  },

  async create(rentData) {
    if (!rentData.product || !rentData.startDate || !rentData.endDate) {
      const error = new Error('Отсутствуют обязательные поля');
      setError(error);
      throw error;
    }
    try {
      const response = await $axios.post('/api/rents', rentData);
      mutations.set('current', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании аренды:', error);
      setError(error);
      throw error;
    }
  },

  async update(rentData) {
    if (!rentData._id) {
      const error = new Error('Отсутствует ID для обновления аренды');
      setError(error);
      throw error;
    }
    try {
      const response = await $axios.post('/api/rents/update', rentData);
      mutations.set('current', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении аренды:', error);
      setError(error);
      throw error;
    }
  },

  async delete(_id) {
    if (!_id) {
      const error = new Error('Отсутствует ID для удаления аренды');
      setError(error);
      throw error;
    }
    try {
      const response = await $axios.post('/api/rents/delete', { _id });
      const index = state.all.findIndex(r => r._id === _id);
      if (index !== -1) {
        state.all.splice(index, 1);
      }
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении аренды:', error);
      setError(error);
      throw error;
    }
  },

  async loadAvailability(params) {
    if (!params.productId) {
      const error = new Error('Product ID is required');
      setError(error);
      throw error;
    }

    try {
      const response = await $axios.get('/api/rents/availability', { params });
      return response.data;
    } catch (error) {
      console.error('Error loading availability data:', error);
      setError(error);
      throw error;
    }
  },
};

async function loadAvailability(params) {
  if (!params.productId) {
    const error = new Error('Product ID is required');
    setError(error);
    throw error;
  }

  try {
    const response = await $axios.get('/api/rents/availability', { params });
    return response.data;
  } catch (error) {
    console.error('Error loading availability data:', error);
    setError(error);
    throw error;
  }
}

export { actions, loadAvailability, mutations, state };
