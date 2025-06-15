// Vue modules
import { reactive, watch } from 'vue';
// Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// State
const state = reactive({
  all: [],
  filter: {
    // query
    tags: [],
    period: '',
    // pagination
  },
  pagination: {
    page: 1,
    perPage: 18,
  },
  // Sort
  sort: {
    param: 'createdAt',
    order: 'desc',
    hideButton: true,
    options: [
      {
        label: 'Date',
        value: 'createdAt',
      },
      {
        label: 'Popularity',
        value: 'views',
      },
      {
        label: 'Creator',
        value: 'creator',
      },
    ],
  },
  current: null,
});

async function read(options = {}) {
  options.params = options.params || {};
  options.params.skip = options.skip || 0;
  options.params.limit = options.limit || 9;
  options.params.tags = options.tags || [];
  // Period
  if (options.period) {
    options.params.period = options.period;
  }
  // Handle fetching a specific post by _id
  if (options.url) {
    options.params = { url: options.url };
  }
  // Handle fetching posts by category
  if (options.category) {
    options.params.category = options.category;
  }
  // Owner
  if (options.owner) {
    options.params.owner = options.owner;
  }
  // Following
  if (options.following) {
    options.params.following = options.following;
  }
  // Creator
  if (options.creator) {
    options.params.creator = options.creator;
  }
  // Status
  if (options.status) {
    options.params.status = options.status;
  }
  // User
  if (options.user) {
    options.params.user = options.user;
  }
  // Sort
  if (options.sortParam) {
    options.params.sortParam = options.sortParam;
  }
  if (options.sortOrder) {
    options.params.sortOrder = options.sortOrder;
  }
  // Handle pagination
  options.params.skip = options.skip || 0;
  options.params.limit = options.limit || 10;

  try {
    console.log('params is', options.params);
    const response = await $axios.get('/api/blog/read', { params: options.params });

    if (options.url) {
      if (response.data && response.data.length > 0) {
        state.current = response.data[0];
      } else {
        state.current = null;
      }
    } else {
      state.all = response.data;
    }

    return Promise.resolve(response.data);
  } catch (err) {
    setError(err);
    return Promise.reject(err);
  }
}
async function create(blogpost) {
  return $axios.post('/api/blog/create', blogpost).then(
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

async function update(blogpost) {
  return $axios.post('/api/blog/update', blogpost).then(
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
  return await $axios.delete(`/api/blog/delete/${_id}`).then(
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

function set(blogpost, property) {
  state[property] = blogpost;
}

function clean() {
  state.current = {
    _id: '',
    url: '',
    status: '',
    name: '',
    tags: [],
    author: '',
    owner: '',
    date: '',
    views: 0,
    content: [],
  };
}

// Actions
function blockAdd(block) {
  const blockNew = {
    order: state.project.content.length + 1,
    type: block.type,
    data: block.data,
    class: block.class,
    content: block.content,
  };
  state.project.content.push(blockNew);
}

const history = [];
history.push(state); // push initial state

watch(state, (newState, oldState) => {
  history.push(newState);
});

export { blockAdd, clean, create, read, remove, set, state, update };
