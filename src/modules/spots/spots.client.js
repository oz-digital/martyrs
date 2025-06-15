// Store
import * as storeSpots from './store/spots.js';
// Router
import routerSpots from './router/spots.js';
// Views
import Spots from './components/layouts/Spots.vue';
import Map from './components/pages/Map.vue';
import Spot from './components/pages/Spot.vue';
import SpotEdit from './components/pages/SpotEdit.vue';
// Importing blocks components
import CardSpot from './components/blocks/CardSpot.vue';
import SpotMemberModify from './components/blocks/SpotMemberModify.vue';
import SpotSub from './components/blocks/SpotSub.vue';

function initializeSpots(app, store, router) {
  router.addRoute('Home', routerSpots);
  store.addStore('spots', storeSpots);
}

const ModuleSpot = {
  initialize: initializeSpots,
  views: {
    store: {
      storeSpots,
    },
    router: {
      routerSpots,
    },
    components: {
      // Pages
      Spots,
      Spot,
      SpotEdit,
      Map,
      // Blocks
      CardSpot,
      SpotMemberModify,
      SpotSub,
    },
  },
};

export default ModuleSpot;
