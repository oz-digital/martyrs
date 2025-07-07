// Store
import * as storeDepartments from './store/departments.js';
import * as storeInvites from './store/invites.js';
import * as storeMemberships from './store/memberships.js';
import * as storeOrganizations from './store/organizations.js';

// Router
import routerOrganization from './router/organizations.js';

// Views
// Pages
import Department from './components/pages/Department.vue';
import DepartmentEdit from './components/pages/DepartmentEdit.vue';
import Organization from './components/pages/Organization.vue';
import OrganizationEdit from './components/pages/OrganizationEdit.vue';
import Organizations from './components/pages/Organizations.vue';

// Blocks
import CardDepartment from './components/blocks/CardDepartment.vue';
import CardOrganization from './components/blocks/CardOrganization.vue';
import Contacts from './components/blocks/Contacts.vue';
import DepartmentSub from './components/blocks/DepartmentSub.vue';
import EmptyState from './components/blocks/EmptyState.vue';
import Rating from './components/blocks/Rating.vue';
import Socials from './components/blocks/Socials.vue';
import Unit from './components/blocks/Unit.vue';

// Sections
import DetailsTabSection from './components/sections/DetailsTabSection.vue';
import Documents from './components/sections/Documents.vue';
import MembersAdd from './components/sections/MembersAdd.vue';
import OrganizationsSection from './components/sections/Organizations.vue';
import Publics from './components/sections/Publics.vue';

// Elements
import ButtonToggleMembership from './components/elements/ButtonToggleMembership.vue';

// Пример функции инициализации для модуля организаций
function initializeOrganization(app, store, router, options = {}) {
  const route = options.route || 'Home';

  router.addRoute(route, routerOrganization);

  store.addStore('departments', storeDepartments);
  store.addStore('memberships', storeMemberships);
  store.addStore('organizations', storeOrganizations);
  store.addStore('invites', storeInvites);
}

// Export components, store modules, and routes
export {
  ButtonToggleMembership,
  CardDepartment,
  CardOrganization,
  Contacts,
  Department,
  DepartmentEdit,
  DepartmentSub,
  DetailsTabSection,
  Documents,
  EmptyState,
  MembersAdd,
  Organization,
  OrganizationEdit,
  Organizations,
  OrganizationsSection,
  Publics,
  Rating,
  Socials,
  Unit,
  routerOrganization,
  storeDepartments,
  storeInvites,
  storeMemberships,
  storeOrganizations,
};

const ModuleOrganization = {
  initialize: initializeOrganization,
  views: {
    store: {
      storeDepartments,
      storeMemberships,
      storeOrganizations,
      storeInvites,
    },
    router: {
      routerOrganization,
    },
    components: {
      // Pages
      Organization,
      Department,
      OrganizationEdit,
      Organizations,
      DepartmentEdit,
      // Blocks
      CardOrganization,
      Unit,
      DepartmentSub,
      CardDepartment,
      Rating,
      EmptyState,
      Contacts,
      Socials,
      // Sections
      MembersAdd,
      DetailsTabSection,
      OrganizationsSection,
      Publics,
      Documents,
      // Elements
      ButtonToggleMembership,
    },
  },
};

export default ModuleOrganization;
