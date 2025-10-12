import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { hasAccess, isAdmin } = useGlobalMixins();

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  const routes = [];

  // Home контекст
  routes.push({
    parentName: route,
    config: {
      basePath: options.basePath || 'gallery',
      meta: {
        title: {
          en: 'Gallery',
          ru: 'Галерея',
        },
        title_hide: true,
      },
      routes: [
        {
          path: '',
          name: 'Gallery',
          meta: {
            title: {
              en: 'Gallery',
              ru: 'Галерея',
            },
            title_hide: true,
          },
          component: () => import(/* webpackChunkName: 'gallery-main' */ '../components/pages/Gallery.vue'),
        },
      ],
    },
  });

  // Backoffice контекст
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'gallery',
        routeNamePrefix: 'Backoffice',
        meta: {
          title: {
            en: 'Gallery',
            ru: 'Галерея',
          },
          context: 'backoffice',
        },
        routes: [
          {
            path: '',
            name: 'Gallery',
            meta: {
              title: {
                en: 'Gallery',
                ru: 'Галерея',
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
            component: () => import(/* webpackChunkName: 'gallery-backoffice' */ '../components/sections/BackofficeGallery.vue'),
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
        basePath: options.organizationBasePath || 'gallery',
        routeNamePrefix: 'Organization_',
        meta: {
          title: {
            en: 'Organization Gallery',
            ru: 'Галерея Организации',
          },
          context: 'organization',
        },
        routes: [
          {
            path: '',
            name: 'Gallery',
            meta: {
              title: {
                en: 'Gallery',
                ru: 'Галерея',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'gallery', 'read', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'gallery-organization' */ '../components/sections/BackofficeGallery.vue'),
          },
        ],
      },
    });
  }

  return routes;
}

export default { getRoutes };
