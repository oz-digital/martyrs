// Store
import * as storeEvents from './store/events.js';

// Router
import { createEventRoutes } from './router/events.js';

// Views
import CardEvent from './components/blocks/CardEvent.vue';
import EventsLayout from './components/layouts/layoutEvents.vue';
import EditEvent from './components/pages/EditEvent.vue';
import Event from './components/pages/Event.vue';
import EventsPage from './components/pages/Events.vue';
import FeaturedEvents from './components/sections/FeaturedEvents.vue';
import Feed from './components/sections/Feed.vue';
import List from './components/sections/List.vue';

// Пример функции инициализации для модуля событий
function initializeEvents(app, store, router, options = {}) {
  const route = options.route || 'Home';

  const routesEvents = createEventRoutes('', options);

  router.addRoute(route, routesEvents);
  router.addRoute('Backoffice Root', createEventRoutes('Backoffice', options));

  store.addStore('events', storeEvents);
}

const ModuleEvents = {
  initialize: initializeEvents,
  views: {
    store: {
      storeEvents,
    },
    router: {
      createEventRoutes,
    },
    components: {
      // Blocks
      CardEvent,
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
  createEventRoutes,
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
