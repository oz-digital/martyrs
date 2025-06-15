import { defineAsyncComponent } from 'vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

export function createGovernanceRoutes(prefix = '', options = {}) {
  const nameWithPrefix = name => (prefix ? `${prefix}${name}` : name);

  const routes = {
    path: options.basePath || 'governance',
    meta: {
      title: {
        en: 'Governance',
        ru: 'Управление',
      },
      title_hide: true,
    },
    children: [
      // Initiatives routes
      {
        path: 'initiatives',
        name: nameWithPrefix('Initiatives'),
        meta: {
          title: {
            en: 'Initiatives',
            ru: 'Инициативы',
          },
          title_hide: false,
        },
        children: [
          {
            path: '',
            name: nameWithPrefix('Initiatives'),
            meta: {
              title: {
                en: 'Initiatives',
                ru: 'Инициативы',
              },
              title_hide: false,
            },
            component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Initiatives.vue'),
          },
          {
            path: 'create',
            name: nameWithPrefix('Create Initiative'),
            meta: {
              title: {
                en: 'Create Initiative',
                ru: 'Создать Инициативу',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/InitiativeCreate.vue'),
          },
          {
            path: ':id',
            name: nameWithPrefix('Initiative'),
            meta: {
              title: {
                en: 'Initiative',
                ru: 'Инициатива',
              },
              title_hide: false,
            },
            component: options.page_initiative || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/Initiative.vue')),
          },
          {
            path: ':id/edit',
            name: nameWithPrefix('Edit Initiative'),
            meta: {
              title: {
                en: 'Edit Initiative',
                ru: 'Редактировать Инициативу',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: options.page_initiative_edit || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/InitiativeCreate.vue')),
          },
        ],
      },

      // Tasks routes
      {
        path: 'tasks',
        name: nameWithPrefix('Tasks'),
        meta: {
          title: {
            en: 'Tasks',
            ru: 'Задачи',
          },
          title_hide: false,
        },
        component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Tasks.vue'),
        children: [
          {
            path: 'create',
            name: nameWithPrefix('Create Task'),
            meta: {
              title: {
                en: 'Create Task',
                ru: 'Создать Задачу',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/TaskCreate.vue'),
          },
          {
            path: ':id',
            name: nameWithPrefix('Task'),
            meta: {
              title: {
                en: 'Task',
                ru: 'Задача',
              },
              title_hide: false,
            },
            component: options.page_task || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/Task.vue')),
          },
          {
            path: ':id/edit',
            name: nameWithPrefix('Edit Task'),
            meta: {
              title: {
                en: 'Edit Task',
                ru: 'Редактировать Задачу',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: options.page_task_edit || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/TaskCreate.vue')),
          },
        ],
      },

      // Votings routes
      {
        path: 'votings',
        name: nameWithPrefix('Votings'),
        meta: {
          title: {
            en: 'Votings',
            ru: 'Голосования',
          },
          title_hide: false,
        },
        component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Votings.vue'),
        children: [
          {
            path: 'create',
            name: nameWithPrefix('Create Voting'),
            meta: {
              title: {
                en: 'Create Voting',
                ru: 'Создать Голосование',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: () => import(/* webpackChunkName: 'Governance' */ '../components/pages/VotingCreate.vue'),
          },
          {
            path: ':id',
            name: nameWithPrefix('Voting'),
            meta: {
              title: {
                en: 'Voting',
                ru: 'Голосование',
              },
              title_hide: false,
            },
            component: options.page_voting || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/Voting.vue')),
          },
          {
            path: ':id/edit',
            name: nameWithPrefix('Edit Voting'),
            meta: {
              title: {
                en: 'Edit Voting',
                ru: 'Редактировать Голосование',
              },
              title_hide: false,
            },
            beforeEnter: [validationAuth.requiresAuth],
            component: options.page_voting_edit || defineAsyncComponent(() => import(/* webpackChunkName: 'Governance' */ '../components/pages/VotingCreate.vue')),
          },
        ],
      },
    ],
  };

  return routes;
}

// Navigation guards
export function setupGovernanceNavigationGuards(router) {
  // Check voting status before allowing votes or edits
  router.beforeEach(async (to, from, next) => {
    if (to.name?.includes('Voting') && to.params.id) {
      try {
        const response = await fetch(`/api/votings/${to.params.id}`);
        const voting = await response.json();

        // Prevent voting on closed votings
        if (voting.status === 'closed' && to.name?.includes('Edit')) {
          next({ name: 'Votings' });
          return;
        }
      } catch (error) {
        console.error('Error checking voting status:', error);
      }
    }
    next();
  });

  // Check initiative status before allowing edits
  router.beforeEach(async (to, from, next) => {
    if (to.name?.includes('Initiative') && to.params.id && to.name?.includes('Edit')) {
      try {
        const response = await fetch(`/api/initiatives/${to.params.id}`);
        const initiative = await response.json();

        // Only allow editing draft initiatives
        if (initiative.status !== 'draft') {
          next({ name: 'Initiatives' });
          return;
        }
      } catch (error) {
        console.error('Error checking initiative status:', error);
      }
    }
    next();
  });
}

// Example usage:
// const governanceRoutes = createGovernanceRoutes('Admin', { basePath: 'admin/governance' });
// export { governanceRoutes, setupGovernanceNavigationGuards };
