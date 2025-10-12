// Dependencies
import { reactive, watch } from 'vue';
// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
// Init State
import orderInitState from '@martyrs/src/modules/orders/store/models/order.js';

const state = reactive({
  all: [],
  current: {
    ...orderInitState,
  },
});

const actions = {
  async create(order) {
    try {
      const response = await $axios.post('/api/orders/create', order);

      state.all.push(response.data);

      return response.data;
    } catch (error) {
      setError(error);
    }
  },

  async read(options = {}) {
    try {
      console.log('options is', options);
      const response = await $axios.get('/api/orders/read', { params: options });

      if (options._id) {
        set(response.data[0], 'current');
      } else {
        set(response.data, 'all');
      }

      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  },

  async update(order) {
    try {
      const response = await $axios.post(`/api/orders/update`, order);

      const index = state.all.findIndex(o => o._id === order._id);

      if (index !== -1) {
        state.all[index] = response.data;
      }

      return response.data;
    } catch (error) {
      setError(error);
    }
  },

  async delete(orderID) {
    try {
      await $axios.delete(`/api/orders/${orderID}`);
      state.all = state.all.filter(o => o._id !== orderID);
    } catch (error) {
      setError(error);
    }
  },

  async changePaymentStatus(orderID, status) {
    try {
      const response = await $axios.post(`/api/orders/payment/${orderID}`, { status });
      const index = state.all.findIndex(o => o._id === orderID);
      if (index !== -1) {
        state.all[index] = response.data;
      }
    } catch (error) {
      setError(error);
    }
  },
};

const mutations = {
  updateRentDates({ positions, productId, dates }) {
    const product = positions.find(p => p._id === productId);

    if (product) {
      product.date = dates; // Предполагается, что dates — объект { start, end }
    }
  },

  addProductToCart(state, product, organization, date) {
    const cartItem = state.positions.find(item => item._id === product._id);

    if (cartItem) {
      cartItem.quantity++;
    } else {
      state.positions.push({
        _id: product._id,
        images: product.images,
        name: product.name,
        listing: product.listing,
        price: product.price,
        price_currency: product.price_currency,
        quantity: 1,
        date: date,
        org_id: organization, // Добавляем _id организации к каждому продукту
      });
    }
  },

  removeProduct(state, _id) {
    const cartItem = state.positions.find(item => item._id === _id);
    const cartItemIndex = state.positions.indexOf(cartItem);

    if (cartItemIndex > -1) {
      state.positions.splice(cartItemIndex, 1);

      // Сохраняем весь объект корзины, а не только позиции
      localStorage.setItem(
        'shopcart',
        JSON.stringify({
          positions: state.positions,
          organization: state.organization,
        })
      );
    }
  },

  decrementItemQuantity(state, _id) {
    const cartItem = state.positions.find(item => item._id === _id);
    const cartItemIndex = state.positions.indexOf(cartItem);

    if (cartItemIndex > -1) {
      cartItem.quantity--;
    }
  },

  incrementItemQuantity(state, _id) {
    const cartItem = state.positions.find(item => item._id === _id);

    if (cartItem) {
      cartItem.quantity++;
    }
  },

  resetCustomer(stateObject) {
    Object.assign(stateObject, customerInitState);
  },
  resetOrder(stateObject) {
    state.current = { ...orderInitState };
    // Object.assign(stateObject, orderInitState);
  },
};

const getters = {
  getTotal(positions) {
    return Number(
      positions.reduce((total, product) => {
        // Проверяем тип листинга
        if (product.listing === 'rent') {
          const start = new Date(product.date.start);
          const end = new Date(product.date.end);
          const diffTime = Math.abs(end - start);
          return total + product.price * (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        } else {
          // Для обычных товаров умножаем на количество
          return total + product.price * (product.quantity || 1);
        }
      }, 0)
    );
  },
  getDeliveryPrice(type, distance = 0, config = {}) {
    if (type === 'pickup') return config.pickupCost || 0;
    if (type === 'post') return config.mailCost || 300;

    if (type === 'courier') {
      const base = config.courierBase || 100;
      const perKm = config.courierPerKm || 20;
      const discount = config.courierDiscountFactor || 7.5;

      return Math.trunc(base + perKm * distance - discount * (distance / 10));
    }

    return 0;
  },
};

function set(eventData, property) {
  state[property] = eventData;
}

const history = [];

history.push(state);

watch(state, (newState, oldState) => {
  history.push(newState);
});

export { actions, getters, mutations, state };
