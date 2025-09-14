import * as validationOwnership from '@martyrs/src/modules/auth/views/middlewares/ownership.validation.js';

export function createRentsRoutes(prefix = '', options = {}) {
  const nameWithPrefix = name => (prefix ? `${prefix}${name}` : name);

  const routes = {
    path: options.basePath || 'rents',
    meta: {
      title: {
        en: 'Renting',
        ru: 'Аренда',
      },
    },
    children: [
      {
        path: '',
        name: nameWithPrefix('Rents'),
        meta: {
          title: {
            en: 'Rents',
            ru: 'Аренды',
          },
        },
        beforeEnter: [validationOwnership.requiresAccess('rents', 'read')],
        component: () => import(/* webpackChunkName: 'Renting' */ '../components/pages/Rents.vue'),
      },
      {
        path: 'create',
        name: nameWithPrefix('Create Rent'),
        meta: {
          title: {
            en: 'Create Rent',
            ru: 'Создать Аренду',
          },
        },
        beforeEnter: [validationOwnership.requiresAccess('rents', 'create')],
        component: () => import(/* webpackChunkName: 'Renting' */ '../components/pages/RentsEdit.vue'),
      },
      {
        path: ':rent/edit',
        name: nameWithPrefix('Edit Rent'),
        meta: {
          title: {
            en: 'Edit Rent',
            ru: 'Редактировать Аренду',
          },
        },
        beforeEnter: [validationOwnership.requiresAccess('rents', 'edit')],
        component: () => import(/* webpackChunkName: 'Renting' */ '../components/pages/RentsEdit.vue'),
      },
    ],
  };

  return routes;
}
