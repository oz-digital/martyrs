/////////////////////////////
// DEPENDENCIES
/////////////////////////////
import { computed, reactive, watch } from 'vue';
// Dependencies
// Globals
import { setError, setSnack } from '@martyrs/src/modules/globals/views/store/globals.js';
// Capacitor Preferences
import { Preferences } from '@capacitor/preferences';

/////////////////////////////
// State
/////////////////////////////
const state = reactive({
  organization: null,
  positions: [],
  currentState: false,
});

/////////////////////////////
// Helpers
/////////////////////////////
const helpers = {
  async saveToStorage() {
    try {
      await Preferences.set({
        key: CART_STORAGE_KEY,
        value: JSON.stringify({
          positions: state.positions,
          organization: state.organization,
        })
      });
    } catch (error) {
      console.warn('Could not save cart to preferences:', error);
    }
  },

  async validateProduct(product) {
    const serverProduct = await api.fetchProduct(product._id);

    if (!serverProduct) {
      return false;
    }

    return serverProduct.price === product.price && serverProduct.name === product.name && serverProduct.available !== false;
  },
};

/////////////////////////////
// SYNC PRODUCT IN SHOPCART
/////////////////////////////
// Constants
const CART_STORAGE_KEY = 'shopcart';
const SYNC_INTERVAL = 30000; // 30 seconds in milliseconds

// API service
const api = {
  async fetchProduct(productId) {
    try {
      const response = await fetch(`/api/products/read`, { _id: productId });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },
};

async function syncWithServer() {
  try {
    const invalidProducts = [];

    for (let i = 0; i < state.positions.length; i++) {
      const product = state.positions[i];
      const serverProduct = await api.fetchProduct(product._id);

      if (!serverProduct || serverProduct.price !== product.price || serverProduct.name !== product.name || serverProduct.available === false) {
        invalidProducts.push(product._id);
      }
    }

    if (invalidProducts.length > 0) {
      state.positions = state.positions.filter(product => !invalidProducts.includes(product._id));
      await helpers.saveToStorage();
      setError('Some products were removed from cart due to changes on server');
    }
  } catch (error) {
    console.error('Failed to sync with server:', error);
  }
}
// Initialize periodic sync
let syncInterval;

const startPeriodicSync = () => {
  syncInterval = setInterval(syncWithServer, SYNC_INTERVAL);
};

const stopPeriodicSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
};

// Start sync when module is imported
// startPeriodicSync();
/////////////////////////////
// Actions
/////////////////////////////
const actions = {
  toggleShopcart() {
    state.currentState = state.currentState ? false : true;
  },

  async setShopcart() {
    try {
      const result = await Preferences.get({ key: 'shopcart' });
      const storedShopcart = result.value;

      if (storedShopcart) {
        const shopcartData = JSON.parse(storedShopcart);
        state.positions = shopcartData.positions; // Восстанавливаем продукты
        state.organization = shopcartData.organization; // Восстанавливаем _id организации
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async addProductToCart(product, variant, organization, date, quantity = 1) {
    console.log('Adding product with variant to cart', { product: product._id, variant: variant._id, quantity });
    
    // Убедимся, что организация установлена
    state.organization = organization;
    
    // Ищем позицию с таким же товаром и вариантом
    const cartItem = state.positions.find(
      item => item._id === product._id && item.variant === variant._id
    );

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      state.positions.push({
        _id: product._id,
        images: variant.images?.length > 0 ? variant.images : product.images,
        name: product.name,
        listing: product.listing,
        price: variant.price || product.price,
        quantity: quantity,
        unit: variant.unit || product.unit,
        date: date,
        variant: variant._id,
        org_id: organization,
      });
    }

    // Сохраняем в Preferences
    await helpers.saveToStorage();
    
    // Отправляем уведомление
    setSnack('Product added to cart');
  },



  async removeProduct(productId, variantId = null) {
    const cartItemIndex = state.positions.findIndex(item => {
      if (variantId) {
        return item._id === productId && item.variant === variantId;
      }
      return item._id === productId;
    });

    if (cartItemIndex > -1) {
      state.positions.splice(cartItemIndex, 1);
      await helpers.saveToStorage();
    }
  },

  async decrementItemQuantity(productId, variantId = null) {
    const cartItem = state.positions.find(item => {
      if (variantId) {
        return item._id === productId && item.variant === variantId;
      }
      return item._id === productId;
    });

    if (cartItem) {
      cartItem.quantity--;

      if (cartItem.quantity < 1) {
        const index = state.positions.indexOf(cartItem);
        state.positions.splice(index, 1);
      }

      await helpers.saveToStorage();
    }
  },

  async incrementItemQuantity(productId, variantId = null) {
    const cartItem = state.positions.find(item => {
      if (variantId) {
        return item._id === productId && item.variant === variantId;
      }
      return item._id === productId;
    });

    if (cartItem) {
      cartItem.quantity++;
      await helpers.saveToStorage();
    }
  },

  async updateRentDates({ productId, variantId, dates }) {
    const product = state.positions.find(p => p._id === productId && p.variant === variantId);

    if (product) {
      product.date = dates;
    }

    helpers.saveToStorage();
  },

  async resetShopcart() {
    state.positions = [];

    try {
      await Preferences.remove({ key: 'shopcart' });
    } catch (error) {
      console.warn('Could not remove cart from preferences:', error);
    }
  },
};

/////////////////////////////
// Getters
/////////////////////////////
const getters = {
  cartTotalPrice: computed(() => {
    return Number(
      state.positions.reduce((total, product) => {
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
  }),
  cartTotalAmount: computed(() => {
    return Number(
      state.positions.reduce((total, product) => {
        return total + product.quantity;
      }, 0)
    );
  }),
  getStoreCartState: computed(() => {
    return Number(state.currentState);
  }),
};
/////////////////////////////
// History
/////////////////////////////
const history = [];
history.push(state);

/////////////////////////////
// Watch
/////////////////////////////
watch(state, (newState, oldState) => {
  history.push(newState);
});

/////////////////////////////
// Module Export
/////////////////////////////
export { actions, getters, state };
