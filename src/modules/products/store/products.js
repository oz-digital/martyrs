/////////////////////////////
// DEPENDENCIES
/////////////////////////////
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
/////////////////////////////
// STATE
/////////////////////////////
const state = reactive({
  all: [],
  current: {
    recommendation: false,
    category: [],
    status: 'draft',
    listing: 'sale',
    attributes: [],
    images: [],
    files: [],
    image3d: false,
    name: '',
    sale: 0,
    price: 0,
    price_cost: 0,
    localization: [],
    recommended: [],
    variants: [],
    discounts: [],
    included: null,
    ingredients: [],
    description: '',
    defaultVariant: {
      price: null,
      quantity: 1,
      unit: 'pcs'
    }
  },
  filter: {
    active: false,
    class: 'mobile-only',
    selected: {},
    options: [
      {
        title: 'Price',
        value: 'price',
        options: [
          { label: 'Pickup', value: 'pickup' },
          { label: 'Courier', value: 'courier' },
          { label: 'Post', value: 'post' },
        ],
      },
    ],
  },
  sort: {
    param: 'popularity',
    order: 'asc',
    options: [
      {
        label: 'Price',
        value: 'variants.price',
      },
      {
        label: 'Popularity',
        value: 'views',
      },
      {
        label: 'New',
        value: 'createdAt',
      },
    ],
  },
});

/////////////////////////////
// ACTIONS
/////////////////////////////
const actions = {
  async create(product) {
    return await $axios.post('/api/products/create', product).then(
      response => {
        set(response.data, 'current');
        return Promise.resolve(response.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async read(options = {}) {

    try {
      const response = await $axios.get('/api/products/read', { params: options });

      if (options._id) {
        state.current = { ...response.data[0] };
        return Promise.resolve(response.data[0]);
      } else {
        return Promise.resolve(response.data);
      }
      return Promise.resolve(response.data);
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async update(_id, product) {
    return await $axios.post('/api/products/' + _id, product).then(
      response => {
        return Promise.resolve(response.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async deleteProduct(_id) {
    return await $axios.delete('/api/products/' + _id).then(
      response => {
        return Promise.resolve(response.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async submitMood(presetMood = null) {
    return $axios.post('/api/product/recommended', { mood: presetMood }).then(
      response => {
        state.current = response.data.product;
        state.current.recommendation = response.data.recommendationText;
        return Promise.resolve(response.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async fetchProducts() {
    return await $axios.get(`/api/products/read`).then(
      products => {
        state.all = products.data;
        return Promise.resolve(products.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async fetchProductsPopular() {
    return await $axios.get(`/api/products/popular`).then(
      products => {
        state.popular = products.data;
        return Promise.resolve(products.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async fetchProductsPublished() {
    return await $axios.get(`/api/products`).then(
      products => {
        let publishedProduct = products.data.filter(function (product, index) {
          return product.status !== 'unpublished';
        });

        state.all = publishedProduct;
        state.filtered = publishedProduct.slice();
        state.filteredPrice = state.filtered;

        state.filteredPrice.sort(function (l, r) {
          return l[state.sort.current] > r[state.sort.current] ? (state.sort.ascending ? 1 : -1) : l[state.sort.current] < r[state.sort.current] ? (state.sort.ascending ? -1 : 1) : 0;
        });

        return Promise.resolve(products.data);
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },

  async fetchProductPopular() {
    return await $axios.get(`/api/products`).then(
      products => {
        state.all = products.data.slice(1, 5);
        return Promise.resolve(products.data.slice(1, 5));
      },
      error => {
        setError(error);
        return Promise.reject(error);
      }
    );
  },
};

const mutations = {
  resetProduct(product) {
    state.current = {
      included: null,
      recommendation: false,
      category: [],
      status: 'draft',
      attributes: [],
      images: [],
      files: [],
      image3d: false,
      name: '',
      sale: 0,
      price: 0,
      price_cost: 0,
      price_currency: '$',
      localization: [],
      variants: [],
      recommended: [],
      discounts: [],
      ingredients: [],
      description: '',
      defaultVariant: {
        price: null,
        quantity: 1,
        unit: 'pcs'
      }
    };
  },
};

function set(product, property) {
  state[property] = product;
}

/////////////////////////////
// GETTERS
/////////////////////////////
const getters = {};

/////////////////////////////
// UTILS
/////////////////////////////

/////////////////////////////
// HISTORY
/////////////////////////////
const history = [];
history.push(state);

/////////////////////////////
// WATCH
/////////////////////////////
watch(state, (newState, oldState) => {
  history.push(newState);
});

/////////////////////////////
// Module Export
/////////////////////////////
export { actions, getters, mutations, state };
