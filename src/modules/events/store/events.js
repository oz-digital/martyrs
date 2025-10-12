// Vue modules
import { reactive, watch } from 'vue';
// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
// State
const state = reactive({
  all: [],
  filter: {
    // query
    tags: [],
    period: '',
    date: null,
    date2: null,
    // pagination
  },
  pagination: {
    page: 1,
    perPage: 18,
  },
  // Sort
  sort: {
    current: 'popularity',
    ascending: false,
  },
  current: {
    _id: '',
    special: false,
    specialData: {},
    cover: '',
    url: '',
    status: '',
    name: '',
    tags: [],
    ticketsTypes: [],
    date: {
      start: null,
      false: null,
    },
    views: 0,
    content: [],
  },
});

async function read(options = {}) {
  try {
    const response = await $axios.get('/api/events/read', { params: options });

    if (options.url) {
      set(response.data, 'current');
    } else {
      set(response.data, 'all');
    }
    return Promise.resolve(response.data);
  } catch (err) {
    setError(err);
    return Promise.reject(err);
  }
}
async function create(eventData) {
  return $axios.post('/api/events/create', eventData).then(
    response => {
      set(response.data, 'current');
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function update(eventData) {
  return $axios.post('/api/events/update', eventData).then(
    response => {
      set(response.data, 'current');
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function remove(_id) {
  return await $axios.post(`/api/events/delete`, { _id: _id }).then(
    response => {
      const index = state.all.findIndex(p => p._id === _id);
      if (index !== -1) {
        state.all.splice(index, 1);
      }
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

function set(eventData, property) {
  state[property] = eventData;
}

function clean() {
  state.current = {
    _id: '',
    cover: '',
    url: '',
    phase: '',
    name: '',
    ticketsTypes: [],
    special: false,
    specialData: {
      subtitle: '',
      logos: [],
      video: '',
      ticketImage: '',
      ticketLinkStripe: '',
      ticketPrice: '',
      guestTitle: '',
      guestDescription: '',
      guestFacebook: '',
      guestInstagram: '',
      guestTwitter: '',
      guestTelegram: '',
      guestSoundcloud: '',
      guestSpotify: '',
      guestVideo: '',
      guests: [],
      lineup: [],
      lineupBackground: '',
      previousVideo: '',
    },
    tags: [],
    date: {
      start: null,
      false: null,
    },
    views: 0,
    content: [],
  };
}

const history = [];
history.push(state); // push initial state

watch(state, (newState, oldState) => {
  history.push(newState);
});

export { clean, create, read, remove, set, state, update };
