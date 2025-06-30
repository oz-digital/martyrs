import { reactive } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
import { buildURL } from '../utils/query-serializer.js';

class Store {
  constructor(apiUrl) {
    this.state = reactive({
      items: [],
      current: {},
    });
    this.apiUrl = apiUrl;
    // console.log(`Store initialized with API URL: ${apiUrl}`);
  }

  // Simplified request method with enhanced debugging
  async request(endpoint, options = {}) {
    // собираем URL
    let url = endpoint.startsWith('http')
      ? endpoint
      : `${this.apiUrl}${endpoint}`;

    // если есть params — используем axios-like сериализацию
    if (options.params) {
      url = buildURL(url, options.params);
      delete options.params;
    }

    // по умолчанию GET, include credentials
    const finalOptions = {
      credentials: 'include',
      headers: {},
      ...options,
    };

    // если есть body — JSONify
    if (finalOptions.body && !finalOptions.headers['Content-Type']) {
      finalOptions.headers['Content-Type'] = 'application/json';
      finalOptions.body = JSON.stringify(finalOptions.body);
    }

    console.log(`→ ${finalOptions.method || 'GET'} ${url}`);
    const res = await fetch(url, finalOptions);
    if (!res.ok) {
      const err = new Error(`Status ${res.status}`);
      err.status = res.status;
      try { err.info = await res.json(); } catch {}
      throw err;
    }
    return res.json();
  }

  async create(item) {
    console.log('Creating item:', item);
    try {
      const result = await this.request('/create', {
        method: 'POST',
        body: item,
      });
      console.log('Create operation succeeded:', result);
      return result;
    } catch (error) {
      console.error('Create operation failed:', error);
      // Log specific error details
      if (error.status) {
        console.error(`HTTP Status: ${error.status}`);
      }
      if (error.errorCode) {
        console.error(`Error Code: ${error.errorCode}`);
      }
      setError(error);
      throw error;
    }
  }

  // вместо текущего read()
  async read(params = {}) {
    console.log('Reading items with params:', params);
    try {
      // передаём все параметры в this.request через params
      const result = await this.request('/read', { params });
      console.log(`Read operation returned ${result.length || 0} items`);
      return result;
    } catch (error) {
      console.error('Read operation failed:', error);
      setError(error);
      throw error;
    }
  }


  async update(item) {
    console.log('Updating item:', item);
    try {
      const result = await this.request('/update', {
        method: 'PUT',
        body: item,
      });
      console.log('Update operation succeeded:', result);
      return result;
    } catch (error) {
      console.error('Update operation failed:', error);
      setError(error);
      throw error;
    }
  }

  async delete(item) {
    console.log('Deleting item:', item);
    try {
      const result = await this.request(`/delete`, {
        method: 'DELETE',
        body: item,
      });
      console.log('Delete operation succeeded');
      return result;
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError(error);
      throw error;
    }
  }

  // Enhanced Mutations utilizing Vue reactivity system efficiently
  setItems(items, state) {
    console.log(`Setting ${items.length} items in state`);
    const targetState = state || this.state.items;
    if (Array.isArray(targetState)) {
      targetState.splice(0, targetState.length, ...items);
    } else {
      console.error('Target state is not an array in setItems');
    }
  }

  addItem(item, state, property = '_id') {
    const targetState = state || this.state.items;
    const existingItemIndex = targetState.findIndex(i => i[property] === item[property]);

    if (existingItemIndex === -1) {
      console.log('Adding new item to state');
      targetState.splice(0, 0, item);
    } else {
      console.log('Updating existing item in state');
      Object.assign(targetState[existingItemIndex], item);
    }
  }

  updateItem(item, state, property = '_id') {
    const targetState = state || this.state.items;
    const index = targetState.findIndex(i => i[property] === item[property]);
    if (index !== -1) {
      console.log('Replacing item in state');
      targetState.splice(index, 1, item);
    } else {
      console.log('Item not found for update in state');
    }
  }

  removeItem(item, state, property = '_id') {
    const targetState = state || this.state.items;
    // Поиск и удаление элемента по указанному ключу
    const index = targetState.findIndex(i => i[property] === item[property]);
    if (index !== -1) {
      console.log('Removing item from state');
      targetState.splice(index, 1);
    } else {
      console.log('Item not found for removal from state');
    }
  }
}

export default Store;
