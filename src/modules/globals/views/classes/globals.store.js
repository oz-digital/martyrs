import { reactive } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

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
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiUrl}${endpoint}`;
    console.log(`Making request to: ${url}`, { method: options.method || 'GET' });

    const defaultOptions = {
      credentials: 'include', // Assumes credentials needed for each request
      headers: {},
    };
    const finalOptions = {
      ...defaultOptions,
      ...options,
    };

    // Set default headers if content type is not explicitly set
    if (!finalOptions.headers['Content-Type'] && options.body) {
      finalOptions.headers['Content-Type'] = 'application/json';
      finalOptions.body = JSON.stringify(options.body);
    }

    try {
      console.log(
        'Request options:',
        JSON.stringify({
          method: finalOptions.method,
          headers: finalOptions.headers,
          bodyLength: finalOptions.body ? JSON.stringify(finalOptions.body).length : 0,
        })
      );

      const response = await fetch(url, finalOptions);
      console.log(`Response status: ${response.status}`);

      // Log response headers for debugging
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorData = { message: 'Failed to parse server response' };
        }

        console.error('Server returned error:', errorData);
        const error = new Error(errorData.message || `Server returned ${response.status}`);
        error.status = response.status;
        error.errorCode = errorData.errorCode || 'UNKNOWN_ERROR';
        error.responseText = await response.text().catch(() => 'Unable to get response text');
        throw error;
      }

      const data = await response.json();
      console.log('Response data received successfully');
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('Network error detected. This might indicate a CORS issue, network connectivity problem, or the server is down.');
        const enhancedError = new Error('Network error: Unable to connect to the server');
        enhancedError.originalError = error;
        setError(enhancedError);
        throw enhancedError;
      }

      setError(error);
      throw error;
    }
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

  async read(options = {}) {
    console.log('Reading items with options:', options);
    try {
      const queryParams = new URLSearchParams(options).toString();
      const result = await this.request(`/read?${queryParams}`);
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
