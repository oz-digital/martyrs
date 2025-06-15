import { reactive, watch } from 'vue';

// State
const state = reactive({
  shops: [],
  popular: [],
  pagination: {
    page: 1,
    perPage: 18,
  },
  search: {
    active: false,
    current: '',
    result: [],
  },
  filter: {
    active: false,
    class: 'mobile-only',
    selected: {},
    options: [
      {
        title: 'Delivery',
        value: 'delivery',
        options: [
          { label: 'Pickup', value: 'pickup' },
          { label: 'Courier', value: 'courier' },
          { label: 'Post', value: 'post' },
        ],
      },
    ],
  },
  sort: {
    param: 'distance',
    order: 'asc',
    options: [
      {
        label: 'Distance',
        value: 'distance',
      },
      {
        label: 'Popularity',
        value: 'views',
      },
      {
        label: 'Products',
        value: 'numberOfProducts',
      },
    ],
  },
});

// History
const history = [];
history.push(state);

// Watch
watch(state, (newState, oldState) => {
  history.push(newState);
});

// Module Export
export { state };
