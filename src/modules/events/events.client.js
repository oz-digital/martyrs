import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';

// Store
import * as storeEvents from './store/events.js';

// Router
import { getRoutes } from './router/events.router.js';

// Views
import CardEvent from './components/blocks/CardEvent.vue';
import CardEventShort from './components/blocks/CardEventShort.vue';
import EventsLayout from './components/layouts/layoutEvents.vue';
import EditEvent from './components/pages/EditEvent.vue';
import Event from './components/pages/Event.vue';
import EventsPage from './components/pages/Events.vue';
import FeaturedEvents from './components/sections/FeaturedEvents.vue';
import Feed from './components/sections/Feed.vue';
import List from './components/sections/List.vue';

// Пример функции инициализации для модуля событий
function initializeEvents(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('events', storeEvents);
}

const ModuleEvents = {
  initialize: initializeEvents,
  views: {
    store: {
      storeEvents,
    },
    router: {
      getRoutes,
    },
    components: {
      // Blocks
      CardEvent,
      CardEventShort,
      // Sections
      Feed,
      List,
      FeaturedEvents,
      // Layouts
      EventsLayout,
      // Pages
      EditEvent,
      Event,
      EventsPage,
    },
  },
};

export {
  // Blocks
  CardEvent,
  CardEventShort,
  getRoutes,
  EditEvent,
  Event,
  EventsLayout,
  EventsPage,
  FeaturedEvents,
  Feed,
  initializeEvents,
  List,
  storeEvents,
};

export default ModuleEvents;
