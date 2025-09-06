// Functional imports (needed for initialize function)
import departmentsStore from './store/departments.store.js';
import invitesStore from './store/invites.store.js';
import membershipsStore from './store/memberships.store.js';
import * as storeOrganizations from './store/organizations.js';

// Router
import routerOrganization from './router/organizations.js';

// Component re-exports (enables tree shaking)
// Pages
export { default as Department } from './components/pages/Department.vue';
export { default as Members } from './components/pages/Members.vue';
export { default as Organization } from './components/pages/Organization.vue';
export { default as OrganizationEdit } from './components/pages/OrganizationEdit.vue';
export { default as Organizations } from './components/pages/Organizations.vue';

// Forms
export { default as DepartmentForm } from './components/forms/DepartmentForm.vue';
export { default as InviteForm } from './components/forms/InviteForm.vue';
export { default as AddExistingMembersForm } from './components/forms/AddExistingMembersForm.vue';

// Blocks
export { default as CardDepartment } from './components/blocks/CardDepartment.vue';
export { default as CardOrganization } from './components/blocks/CardOrganization.vue';
export { default as Contacts } from './components/blocks/Contacts.vue';
export { default as DepartmentSub } from './components/blocks/DepartmentSub.vue';
export { default as EmptyState } from './components/blocks/EmptyState.vue';
export { default as Rating } from './components/blocks/Rating.vue';
export { default as Socials } from './components/blocks/Socials.vue';
export { default as Unit } from './components/blocks/Unit.vue';

// Sections
export { default as Documents } from './components/sections/Documents.vue';
export { default as MembersAdd } from './components/sections/MembersAdd.vue';
export { default as OrganizationsSection } from './components/sections/Organizations.vue';
export { default as Publics } from './components/sections/Publics.vue';

// Elements
export { default as ButtonToggleMembership } from './components/elements/ButtonToggleMembership.vue';

// Пример функции инициализации для модуля организаций
function initializeOrganization(app, store, router, options = {}) {
  const route = options.route || 'Home';

  router.addRoute(route, routerOrganization);

  store.addStore('organizations', storeOrganizations);
}

// Functional exports
export {
  departmentsStore,
  invitesStore,
  membershipsStore,
  routerOrganization,
  storeOrganizations,
  initializeOrganization as initialize,
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
  },
};

export default ModuleOrganization;
