import { defineAsyncComponent } from 'vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

export function createEventRoutes(prefix = '', options = {}) {
  const nameWithPrefix = name => (prefix ? `${prefix}${name}` : name);

  const routes = {
    path: options.basePath || 'events',
    meta: {
      title: {
        en: 'Events',
        ru: 'События',
      },
      title_hide: true,
    },
    children: [
      {
        path: '',
        name: nameWithPrefix('Events'),
        meta: {
          title: {
            en: 'Events',
            ru: 'События',
          },
          title_hide: true,
        },
        component: () => import(/* webpackChunkName: 'Events' */ '../components/pages/Events.vue'),
      },
      {
        path: 'search',
        name: nameWithPrefix('Events Search'),
        meta: {
          title: {
            en: 'Events',
            ru: 'События',
          },
          title_hide: true,
        },
        component: () => import(/* webpackChunkName: 'Events' */ '../components/pages/EventsSearch.vue'),
      },
      {
        path: 'backoffice',
        name: nameWithPrefix('Events Backoffice'),
        meta: {
          title: {
            en: 'Manage Events',
            ru: 'Управление Событиями',
          },
          title_hide: false,
        },

        component: () => import(/* webpackChunkName: 'Events' */ '../components/pages/EventsBackoffice.vue'),
      },
      {
        path: 'create',
        name: nameWithPrefix('Create Event'),
        meta: {
          title: {
            en: 'Create Event',
            ru: 'Создать Событие',
          },
          title_hide: false,
        },
        beforeEnter: [validationAuth.requiresAuth],
        component: () => import(/* webpackChunkName: 'Events' */ '../components/pages/EditEvent.vue'),
      },
      {
        path: ':url',
        name: nameWithPrefix('Event'),
        meta: {
          title: {
            en: 'Event',
            ru: 'Событие',
          },
          title_hide: false,
        },
        component: options.page_event || defineAsyncComponent(() => import(/* webpackChunkName: 'Events' */ '../components/pages/Event.vue')),
      },
      {
        path: ':url/edit',
        name: nameWithPrefix('Edit Event'),
        meta: {
          title: {
            en: 'Edit Event',
            ru: 'Редактировать Событие',
          },
          title_hide: false,
        },
        beforeEnter: [validationAuth.requiresAuth],
        component: options.page_event_edit || defineAsyncComponent(() => import(/* webpackChunkName: 'Events' */ '../components/pages/EditEvent.vue')),
      },
      {
        path: ':url/edit/tickets',
        name: nameWithPrefix('Edit Event Tickets'),
        meta: {
          title: {
            en: 'Event Tickets',
            ru: 'Билеты События',
          },
          title_hide: false,
        },
        beforeEnter: [validationAuth.requiresAuth],
        component: () => import(/* webpackChunkName: 'Events' */ '../components/pages/EditEventTickets.vue'),
      },
    ],
  };

  return routes;
}
