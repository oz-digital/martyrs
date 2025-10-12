import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { hasAccess, isAdmin } = useGlobalMixins();

export function getRoutes(options = {}) {
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  const routes = [];

  // Backoffice контекст
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'categories',
        routeNamePrefix: 'Backoffice',
        meta: {
          title: {
            en: 'Categories',
            ru: 'Категории',
          },
          context: 'backoffice',
        },
        routes: [
          {
            path: '',
            name: 'Categories',
            meta: {
              title: {
                en: 'Categories',
                ru: 'Категории',
              },
            },
            component: () => import(/* webpackChunkName: 'categories-backoffice' */ '../components/pages/Categories.vue'),
          },
          {
            path: 'add',
            name: 'CategoryAdd',
            meta: {
              title: {
                en: 'Add Category',
                ru: 'Добавить категорию',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'category-backoffice-edit' */ '../components/pages/CategoryEdit.vue'),
          },
          {
            path: ':category/edit',
            name: 'CategoryEdit',
            meta: {
              title: {
                en: 'Edit Category',
                ru: 'Редактировать категорию',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'category-backoffice-edit' */ '../components/pages/CategoryEdit.vue'),
          },
        ],
      },
    });
  }

  // Organizations контекст
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: options.organizationBasePath || 'categories',
        routeNamePrefix: 'Organization_',
        meta: {
          title: {
            en: 'Organization Categories',
            ru: 'Категории Организации',
          },
          context: 'organization',
        },
        routes: [
          {
            path: '',
            name: 'Categories',
            meta: {
              title: {
                en: 'Categories',
                ru: 'Категории',
              },
            },
            component: () => import(/* webpackChunkName: 'categories' */ '../components/pages/Categories.vue'),
          },
          {
            path: 'add',
            name: 'CategoryAdd',
            meta: {
              title: {
                en: 'Add Category',
                ru: 'Добавить категорию',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'categories', 'create', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'category-edit' */ '../components/pages/CategoryEdit.vue'),
          },
          {
            path: ':category/edit',
            name: 'CategoryEdit',
            meta: {
              title: {
                en: 'Edit Category',
                ru: 'Редактировать категорию',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'categories', 'edit', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'category-edit' */ '../components/pages/CategoryEdit.vue'),
          },
        ],
      },
    });
  }

  return routes;
}

export default { getRoutes };
