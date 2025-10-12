import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { hasAccess, isAdmin } = useGlobalMixins();

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  const routes = [];

  // Home контекст - только карта
  routes.push({
    parentName: route,
    config: {
      basePath: options.basePath || 'spots',
      component: () => import(/* webpackChunkName: "layout-empty" */ '@martyrs/src/modules/core/views/components/layouts/Empty.vue'),
      meta: {
        title: {
          en: 'Spots',
          ru: 'Места',
        },
        title_hide: true,
        breadcrumbs: {
          hide: true,
          hidden: true,
        },
      },
      routes: [
        {
          path: ':country?',
          component: () => import(/* webpackChunkName: "layout-spots" */ '../components/layouts/Spots.vue'),
          meta: {
            title: {
              en: 'Spots',
              ru: 'Места',
            },
            header_theme: 'dark',
            footer_theme: 'dark',
          },
          children: [
            {
              path: ':state?',
              name: 'Spots State',
              component: () => import(/* webpackChunkName: 'spots-map' */ '../components/pages/Map.vue'),
              children: [
                {
                  path: ':city?',
                  name: 'Spots City',
                  component: () => import(/* webpackChunkName: 'spots-map' */ '../components/pages/Map.vue'),
                },
              ],
            },
          ],
        },
      ],
    }
  });

  // Backoffice контекст
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'spots',
        routeNamePrefix: 'Backoffice',
        meta: {
          title: {
            en: 'Spots',
            ru: 'Места',
          },
          context: 'Backoffice',
        },
        routes: [
          {
            path: '',
            name: 'Spots',
            meta: {
              title: {
                en: 'Spots',
                ru: 'Места',
              },
              title_hide: true,
            },
            component: () => import(/* webpackChunkName: 'spots-list' */ '../components/pages/Spots.vue'),
          },
          {
            path: 'create',
            name: 'Create Spot',
            meta: {
              title: {
                en: 'Create Spot',
                ru: 'Создать Место',
              },
              title_hide: false,
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
            component: () => import(/* webpackChunkName: 'spot-edit' */ '../components/pages/SpotEdit.vue'),
          },
          // {
          //   path: ':spot',
          //   name: 'Spot',
          //   meta: {
          //     title: {
          //       en: 'Spot',
          //       ru: 'Место',
          //     },
          //     title_hide: false,
          //   },
          //   component: () => import(/* webpackChunkName: 'spot-detail' */ '../components/pages/Spot.vue'),
          // },
          {
            path: ':spot/edit',
            name: 'Edit Spot',
            meta: {
              title: {
                en: 'Edit Spot',
                ru: 'Редактировать Место',
              },
              title_hide: false,
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
            component: () => import(/* webpackChunkName: 'spot-edit' */ '../components/pages/SpotEdit.vue'),
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
        basePath: options.organizationBasePath || 'spots',
        routeNamePrefix: 'Organization',
        meta: {
          title: {
            en: 'Organization Spots',
            ru: 'Места Организации',
          },
          context: 'Organization',
        },
        routes: [
          {
            path: '',
            name: 'Spots',
            meta: {
              title: {
                en: 'Spots',
                ru: 'Места',
              },
              title_hide: true,
            },
            component: () => import(/* webpackChunkName: 'spots-list' */ '../components/pages/Spots.vue'),
          },
          {
            path: 'create',
            name: 'Create Spot',
            meta: {
              title: {
                en: 'Create Spot',
                ru: 'Создать Место',
              },
              title_hide: false,
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'spots', 'create', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'spot-edit' */ '../components/pages/SpotEdit.vue'),
          },
          // {
          //   path: ':spot',
          //   name: 'Spot',
          //   meta: {
          //     title: {
          //       en: 'Spot',
          //       ru: 'Место',
          //     },
          //     title_hide: false,
          //   },
          //   component: () => import(/* webpackChunkName: 'spot-detail' */ '../components/pages/Spot.vue'),
          // },
          {
            path: ':spot/edit',
            name: 'Edit Spot',
            meta: {
              title: {
                en: 'Edit Spot',
                ru: 'Редактировать Место',
              },
              title_hide: false,
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'spots', 'edit', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'spot-edit' */ '../components/pages/SpotEdit.vue'),
          },
        ],
      }
    });
  }

  return routes;
}

export default { getRoutes };