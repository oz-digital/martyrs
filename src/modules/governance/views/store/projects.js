const isProd = process.env.NODE_ENV === 'production';
// Dependencies
import axios from 'axios';

const clientUrl = process.env.API_URL;

const $axios = axios.create({ baseURL: clientUrl });
// Vue modules
import { computed, reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// State
const state = reactive({
  all: [],
  editor: true,
  project: {
    name: '',
    description: '',
    url: '',

    video: '',
    size: '',

    services: [],
    client: '',
    cover: {},
    published: {},

    structure: {
      blocks: [],
      type: '',
      style: '',
      new: {
        order: 1,
        type: '',
        style: '',
        content: '',
      },
      current: {
        order: 1,
        type: '',
        style: '',
        content: '',
      },
      currentArray: [],
    },
  },
});

// Update existing categoryZzzz
async function fetchProjects() {
  return await $axios.get(`/projects`).then(response => {
    setProjects(response.data);
    return Promise.resolve(response.data);
  });
}

async function addProject(project) {
  console.log(project);
  return $axios.post('/projects/add', project).then(
    response => {
      setProject(response.data);
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}

async function updateProject(project) {
  return $axios.post('/projects/' + project.url, project).then(
    response => {
      setProject(response.data);
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.reject(error);
    }
  );
}
// Actions
async function loadProject(url) {
  return await $axios.get('/projects/' + url).then(
    response => {
      setProject(response.data);
      return Promise.resolve(response.data);
    },
    error => {
      setError(error);
      return Promise.resolve(error);
    }
  );
}

function blockAdd(block) {
  const blockNew = {
    order: state.project.structure.blocks.length + 1,
    type: block.type,
    data: block.data,
    class: block.class,
    content: block.content,
  };
  state.project.structure.blocks.push(blockNew);
}

// Mutations
function setProjects(projects) {
  state.all = projects;
}
function setProject(project) {
  state.project = project;
}
// Gettes
const getProject = computed(() => state.project);

const history = [];
history.push(state); // push initial state

watch(state, (newState, oldState) => {
  history.push(newState);
});

export function filterProjects(filter, projects) {
  let filteredList = [...projects];

  // Filter status
  if (filter.status == 'all') {
    const filtered = filteredList;
    filteredList = filtered;
  }
  if (filter.status !== 'all') {
    const filtered = filteredList.filter(project => {
      var projectsArr = project.status.toString().split(' ');
      return (
        projectsArr.filter(function (category) {
          return category.indexOf(filter.status) > -1;
        }).length === 1
      );
    });
    filteredList = filtered;
  }
  return filteredList;
}

export { addProject, blockAdd, fetchProjects, getProject, loadProject, state, updateProject };
