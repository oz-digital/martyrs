import * as validationOwnership from '@martyrs/src/modules/auth/views/middlewares/ownership.validation.js';

function buildRentRoutes(options = {}) {
  return [
    {
      path: '',
      name: 'Rents',
      meta: {
        title: {
          en: 'Rents',
          ru: 'Аренды',
        },
      },
      beforeEnter: [validationOwnership.requiresAccess('rents', 'read')],
      component: () => import(
        /* webpackChunkName: 'Renting' */
        './views/components/pages/Rents.vue'
      ),
    },
    {
      path: 'create',
      name: 'Create Rent',
      meta: {
        title: {
          en: 'Create Rent',
          ru: 'Создать Аренду',
        },
      },
      beforeEnter: [validationOwnership.requiresAccess('rents', 'create')],
      component: () => import(
        /* webpackChunkName: 'Renting' */
        './views/components/pages/RentsEdit.vue'
      ),
    },
    {
      path: ':rent/edit',
      name: 'Edit Rent',
      meta: {
        title: {
          en: 'Edit Rent',
          ru: 'Редактировать Аренду',
        },
      },
      beforeEnter: [validationOwnership.requiresAccess('rents', 'edit')],
      component: () => import(
        /* webpackChunkName: 'Renting' */
        './views/components/pages/RentsEdit.vue'
      ),
    },
  ];
}

export function getRoutes(options = {}) {
  const routes = [];

  const routeHome = options.route || options.routeHome || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  if (!options.withPublicRoutes) {
    routes.push({
      parentName: routeHome,
      config: {
        basePath: options.basePath || options.publicBasePath || 'rents',
        meta: {
          title: {
            en: 'Renting',
            ru: 'Аренда',
          },
        },
        routes: buildRentRoutes(options),
      },
    });
  }

  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'rents',
        routeNamePrefix: options.backofficeRouteNamePrefix || 'Backoffice',
        meta: {
          title: {
            en: 'Renting',
            ru: 'Аренда',
          },
          context: 'backoffice',
        },
        routes: buildRentRoutes(options),
      },
    });
  }

  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: options.organizationBasePath || 'rents',
        routeNamePrefix: options.organizationRouteNamePrefix || 'Organization_',
        meta: {
          title: {
            en: 'Organization Rents',
            ru: 'Аренды Организации',
          },
          context: 'organization',
        },
        routes: buildRentRoutes(options),
      },
    });
  }

  return routes;
}

export default { getRoutes };
