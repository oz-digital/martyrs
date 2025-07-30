// Store
import departmentsStore from './store/departments.store.js';
import invitesStore from './store/invites.store.js';
import membershipsStore from './store/memberships.store.js';
import * as storeOrganizations from './store/organizations.js';

// Router
import routerOrganization from './router/organizations.js';

// Views
// Pages
import Department from './components/pages/Department.vue';
import Members from './components/pages/Members.vue';
import Organization from './components/pages/Organization.vue';
import OrganizationEdit from './components/pages/OrganizationEdit.vue';
import Organizations from './components/pages/Organizations.vue';

// Forms
import DepartmentForm from './components/forms/DepartmentForm.vue';
import InviteForm from './components/forms/InviteForm.vue';
import AddExistingMembersForm from './components/forms/AddExistingMembersForm.vue';

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

  store.addStore('organizations', storeOrganizations);
}

// Export components, store modules, and routes
export {
  AddExistingMembersForm,
  ButtonToggleMembership,
  CardDepartment,
  CardOrganization,
  Contacts,
  Department,
  DepartmentForm,
  DepartmentSub,
  departmentsStore,
  Documents,
  EmptyState,
  InviteForm,
  invitesStore,
  Members,
  MembersAdd,
  membershipsStore,
  Organization,
  OrganizationEdit,
  Organizations,
  OrganizationsSection,
  Publics,
  Rating,
  Socials,
  Unit,
  routerOrganization,
  storeOrganizations,
};

const ModuleOrganization = {
  initialize: initializeOrganization,
  views: {
    store: {
      departmentsStore,
      invitesStore,
      membershipsStore,
      storeOrganizations,
    },
    router: {
      routerOrganization,
    },
    components: {
      // Pages
      Organization,
      Department,
      Members,
      OrganizationEdit,
      Organizations,
      // Forms
      DepartmentForm,
      InviteForm,
      AddExistingMembersForm,
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
      OrganizationsSection,
      Publics,
      Documents,
      // Elements
      ButtonToggleMembership,
    },
  },
};

export default ModuleOrganization;
