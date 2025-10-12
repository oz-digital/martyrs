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
      basePath: options.basePath || 'events',
      meta: {
        title: {
          en: 'Events',
          ru: 'События',
        },
        title_hide: true,
      },
      routes: [
        {
          path: '',
          name: 'Events',
          meta: {
            title: {
              en: 'Events',
              ru: 'События',
            },
            title_hide: true,
          },
          component: () => import(/* webpackChunkName: 'events-list' */ '../components/pages/Events.vue'),
        },
        {
          path: 'search',
          name: 'Events Search',
          meta: {
            title: {
              en: 'Events',
              ru: 'События',
            },
            title_hide: true,
          },
          component: () => import(/* webpackChunkName: 'events-search' */ '../components/pages/EventsSearch.vue'),
        },
        {
          path: 'create',
          name: 'Create Event',
          meta: {
            title: {
              en: 'Create Event',
              ru: 'Создать Событие',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
        },
        {
          path: ':url',
          name: 'Event',
          meta: {
            title: {
              en: 'Event',
              ru: 'Событие',
            },
            title_hide: false,
          },
          component: () => import(/* webpackChunkName: 'events-detail' */ '../components/pages/Event.vue'),
        },
        {
          path: ':url/edit',
          name: 'Edit Event',
          meta: {
            title: {
              en: 'Edit Event',
              ru: 'Редактировать Событие',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
        },
        {
          path: ':url/edit/tickets',
          name: 'Edit Event Tickets',
          meta: {
            title: {
              en: 'Event Tickets',
              ru: 'Билеты События',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: 'events-tickets' */ '../components/pages/EditEventTickets.vue'),
        },
      ],
    },
  });

  // Backoffice контекст
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'events',
        routeNamePrefix: 'Backoffice',
        meta: {
          title: {
            en: 'Events',
            ru: 'События',
          },
          context: 'backoffice',
        },
        routes: [
          {
            path: '',
            name: 'Events',
            meta: {
              title: {
                en: 'Events',
                ru: 'События',
              },
              title_hide: true,
            },
            component: () => import(/* webpackChunkName: 'events-list' */ '../components/pages/EventsBackoffice.vue'),
          },
          {
            path: 'create',
            name: 'Create Event',
            meta: {
              title: {
                en: 'Create Event',
                ru: 'Создать Событие',
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
            component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
          },
          {
            path: ':url',
            name: 'Event',
            meta: {
              title: {
                en: 'Event',
                ru: 'Событие',
              },
              title_hide: false,
            },
            component: () => import(/* webpackChunkName: 'events-detail' */ '../components/pages/Event.vue'),
          },
          {
            path: ':url/edit',
            name: 'Edit Event',
            meta: {
              title: {
                en: 'Edit Event',
                ru: 'Редактировать Событие',
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
            component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
          },
          {
            path: ':url/edit/tickets',
            name: 'Edit Event Tickets',
            meta: {
              title: {
                en: 'Event Tickets',
                ru: 'Билеты События',
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
            component: () => import(/* webpackChunkName: 'events-tickets' */ '../components/pages/EditEventTickets.vue'),
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
        basePath: options.organizationBasePath || 'events',
        routeNamePrefix: 'Organization_',
        meta: {
          title: {
            en: 'Organization Events',
            ru: 'События Организации',
          },
          context: 'organization',
        },
        routes: [
          {
            path: '',
            name: 'Events',
            meta: {
              title: {
                en: 'Events',
                ru: 'События',
              },
              title_hide: true,
            },
            component: () => import(/* webpackChunkName: 'events-list' */ '../components/pages/EventsBackoffice.vue'),
          },
          {
            path: 'create',
            name: 'Create Event',
            meta: {
              title: {
                en: 'Create Event',
                ru: 'Создать Событие',
              },
              title_hide: false,
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'events', 'create', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
          },
          {
            path: ':url',
            name: 'Event',
            meta: {
              title: {
                en: 'Event',
                ru: 'Событие',
              },
              title_hide: false,
            },
            component: () => import(/* webpackChunkName: 'events-detail' */ '../components/pages/Event.vue'),
          },
          {
            path: ':url/edit',
            name: 'Edit Event',
            meta: {
              title: {
                en: 'Edit Event',
                ru: 'Редактировать Событие',
              },
              title_hide: false,
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'events-edit' */ '../components/pages/EditEvent.vue'),
          },
          {
            path: ':url/edit/tickets',
            name: 'Edit Event Tickets',
            meta: {
              title: {
                en: 'Event Tickets',
                ru: 'Билеты События',
              },
              title_hide: false,
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: 'events-tickets' */ '../components/pages/EditEventTickets.vue'),
          },
        ],
      },
    });
  }

  return routes;
}

export default { getRoutes };
