import { defineAsyncComponent } from 'vue';
import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

function resolveComponent(loader, override) {
  if (override) return override;
  return defineAsyncComponent(loader);
}

function buildGovernanceRoutes(options = {}) {
  const governanceIndexComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Governance.vue'),
    options.page_governance_index
  );
  const initiativesComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Initiatives.vue'),
    options.page_initiatives
  );
  const initiativeComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Initiative.vue'),
    options.page_initiative
  );
  const initiativeCreateComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/InitiativeCreate.vue'),
    options.page_initiative_create
  );
  const roadmapComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Roadmap.vue'),
    options.page_roadmap
  );
  const initiativeMilestonesComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/InitiativeMilestones.vue'),
    options.page_initiative_milestones
  );
  const milestoneComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Milestone.vue'),
    options.page_milestone
  );
  const tasksComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Tasks.vue'),
    options.page_tasks
  );
  const taskComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Task.vue'),
    options.page_task
  );
  const taskCreateComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/TaskCreate.vue'),
    options.page_task_create
  );
  const votingsComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Votings.vue'),
    options.page_votings
  );
  const votingComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/Voting.vue'),
    options.page_voting
  );
  const votingCreateComponent = resolveComponent(
    () => import(/* webpackChunkName: 'Governance' */ '../components/pages/VotingCreate.vue'),
    options.page_voting_create
  );

  return [
    {
      path: '',
      name: 'Governance',
      meta: {
        title: {
          en: 'Governance',
          ru: 'Управление',
        },
        title_hide: false,
      },
      component: governanceIndexComponent,
    },
    {
      path: 'initiatives',
      name: 'InitiativesSection',
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
          name: 'Initiatives',
          meta: {
            title: {
              en: 'Initiatives',
              ru: 'Инициативы',
            },
            title_hide: false,
          },
          component: initiativesComponent,
        },
        {
          path: 'create',
          name: 'Create Initiative',
          meta: {
            title: {
              en: 'Create Initiative',
              ru: 'Создать Инициативу',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: initiativeCreateComponent,
        },
        {
          path: ':id',
          name: 'Initiative',
          meta: {
            title: {
              en: 'Initiative',
              ru: 'Инициатива',
            },
            title_hide: false,
          },
          component: initiativeComponent,
        },
        {
          path: ':id/edit',
          name: 'Edit Initiative',
          meta: {
            title: {
              en: 'Edit Initiative',
              ru: 'Редактировать Инициативу',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: resolveComponent(
            () => import(/* webpackChunkName: 'Governance' */ '../components/pages/InitiativeCreate.vue'),
            options.page_initiative_edit
          ),
        },
        {
          path: ':id/roadmap',
          name: 'Roadmap',
          meta: {
            title: {
              en: 'Roadmap',
              ru: 'Дорожная карта',
            },
            title_hide: false,
          },
          component: roadmapComponent,
        },
        {
          path: ':id/milestones',
          name: 'InitiativeMilestones',
          meta: {
            title: {
              en: 'Milestones',
              ru: 'Вехи',
            },
            title_hide: false,
          },
          component: initiativeMilestonesComponent,
        },
      ],
    },
    {
      path: 'milestones/:id',
      name: 'Milestone',
      meta: {
        title: {
          en: 'Milestone',
          ru: 'Веха',
        },
        title_hide: false,
      },
      component: milestoneComponent,
    },
    {
      path: 'tasks',
      name: 'Tasks',
      meta: {
        title: {
          en: 'Tasks',
          ru: 'Задачи',
        },
        title_hide: false,
      },
      component: tasksComponent,
      children: [
        {
          path: 'create',
          name: 'Create Task',
          meta: {
            title: {
              en: 'Create Task',
              ru: 'Создать Задачу',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: taskCreateComponent,
        },
        {
          path: ':id',
          name: 'Task',
          meta: {
            title: {
              en: 'Task',
              ru: 'Задача',
            },
            title_hide: false,
          },
          component: taskComponent,
        },
        {
          path: ':id/edit',
          name: 'Edit Task',
          meta: {
            title: {
              en: 'Edit Task',
              ru: 'Редактировать Задачу',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: resolveComponent(
            () => import(/* webpackChunkName: 'Governance' */ '../components/pages/TaskCreate.vue'),
            options.page_task_edit
          ),
        },
      ],
    },
    {
      path: 'votings',
      name: 'Votings',
      meta: {
        title: {
          en: 'Votings',
          ru: 'Голосования',
        },
        title_hide: false,
      },
      component: votingsComponent,
      children: [
        {
          path: 'create',
          name: 'Create Voting',
          meta: {
            title: {
              en: 'Create Voting',
              ru: 'Создать Голосование',
            },
            title_hide: false,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: votingCreateComponent,
        },
        {
          path: ':id',
          name: 'Voting',
          meta: {
            title: {
              en: 'Voting',
              ru: 'Голосование',
            },
            title_hide: false,
          },
          component: votingComponent,
        },
        {
          path: ':id/edit',
          name: 'Edit Voting',
          meta: {
            title: {
              en: 'Edit Voting',
              ru: 'Редактировать Голосование',
            },
            title_hide: false,
          },
          beforeEnter: [
            () => import('@martyrs/src/modules/auth/views/middlewares/auth.validation.js')
              .then(m => m.requiresAuth)
          ],
          component: resolveComponent(
            () => import(/* webpackChunkName: 'Governance' */ '../components/pages/VotingCreate.vue'),
            options.page_voting_edit
          ),
        },
      ],
    },
  ];
}

export function getRoutes(options = {}) {
  const routes = [];
  const routeHome = options.route || options.routeHome || 'Home';
  const baseMeta = {
    title: {
      en: 'Governance',
      ru: 'Управление',
    },
    title_hide: true,
  };

  routes.push({
    parentName: routeHome,
    config: {
      basePath: options.basePath || options.publicBasePath || 'governance',
      meta: baseMeta,
      routeNamePrefix: options.routeNamePrefix || options.publicRouteNamePrefix || '',
      routes: buildGovernanceRoutes(options),
    },
  });

  const routeBackoffice = options.routeBackoffice;
  if (routeBackoffice && !options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'governance',
        routeNamePrefix: options.backofficeRouteNamePrefix || 'Backoffice ',
        meta: {
          ...baseMeta,
          context: 'backoffice',
        },
        routes: buildGovernanceRoutes(options),
      },
    });
  }

  const routeOrganizations = options.routeOrganizations;
  if (routeOrganizations && !options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: options.organizationBasePath || 'governance',
        routeNamePrefix: options.organizationRouteNamePrefix || 'Organization_',
        meta: {
          ...baseMeta,
          context: 'organization',
        },
        routes: buildGovernanceRoutes(options),
      },
    });
  }

  return routes;
}

export default { getRoutes };
