/////////////////////////////
// DEPENDENCIES
/////////////////////////////
import { computed, reactive, watch } from 'vue';
// Dependencies
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';

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
  createCartItem(product, organization, type = 'sale') {
    return {
      _id: product._id,
      images: product.images,
      name: product.name,
      price: product.price,
      listing: product.listing,
      quantity: 1,
      org_id: organization,
      type: type,
    };
  },

  saveToStorage() {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        positions: state.positions,
        organization: state.organization,
      })
    );
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
      helpers.saveToStorage();
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

  setShopcart() {
    try {
      const storedShopcart = localStorage.getItem('shopcart');

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

  addProductToCart(product, organization, date) {
    console.log('organization shopcart is', organization);
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
        quantity: 1,
        date: date,
        org_id: organization, // Добавляем _id организации к каждому продукту
      });
    }
    state.organization = organization;

    // Обновляем объект корзины в localStorage, включая _id организации
    localStorage.setItem(
      'shopcart',
      JSON.stringify({
        positions: state.positions,
        organization: organization, // Сохраняем _id организации в корне объекта корзины
      })
    );
  },

  async addVariantToCart(variantItem, organizationId, selectedDates = null) {
    try {
      // Убедимся, что организация установлена 
      state.organization = organizationId;
      
      // Проверим, есть ли этот вариант уже в корзине
      const existingPosition = state.positions.find(
        position => position.product._id === variantItem._id && position.variantId === variantItem.variantId
      );
      
      if (existingPosition) {
        // Обновляем существующую позицию
        existingPosition.quantity += 1;
        
        // Если есть выбранные даты для аренды, обновляем их
        if (selectedDates) {
          existingPosition.selectedDates = selectedDates;
        }
      } else {
        // Создаем новую позицию
        const position = {
          product: {
            _id: variantItem._id,
            name: variantItem.name,
            price: variantItem.price,
            sku: variantItem.sku
          },
          variantId: variantItem.variantId,
          attributes: variantItem.attributes || [],
          quantity: 1,
          price: variantItem.price,
        };
        
        // Добавляем даты для товаров с арендой
        if (selectedDates) {
          position.selectedDates = selectedDates;
        }
        
        // Добавляем позицию в корзину
        state.positions.push(position);
      }
      
      // Обновляем локальное хранилище
      updateLocalStorage();
      
      // Отправляем уведомление о добавлении в корзину
      showNotification('Product added to cart');
      
      return true;
    } catch (error) {
      console.error('Error adding variant to cart:', error);
      return false;
    }
  },


  removeProduct(_id) {
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

  decrementItemQuantity(_id) {
    const cartItem = state.positions.find(item => item._id === _id);
    const cartItemIndex = state.positions.indexOf(cartItem);

    if (cartItemIndex > -1) {
      cartItem.quantity--;

      if (cartItem.quantity < 1) {
        state.positions.splice(cartItemIndex, 1);
      }

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

  incrementItemQuantity(_id) {
    const cartItem = state.positions.find(item => item._id === _id);

    if (cartItem) {
      cartItem.quantity++;

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

  updateRentDates({ productId, dates }) {
    const product = state.positions.find(p => p._id === productId);

    if (product) {
      product.date = dates; // Предполагается, что dates — объект { start, end }
    }

    localStorage.setItem(
      'shopcart',
      JSON.stringify({
        positions: state.positions,
        organization: state.organization,
      })
    );
  },

  resetShopcart() {
    state.positions = [];

    localStorage.removeItem('shopcart');
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
