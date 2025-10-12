import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import { navigationItems } from '@martyrs/src/modules/organizations/configs/navigation.organization.config.js';
import layoutEmpty from '@martyrs/src/modules/core/views/components/layouts/Empty.vue';

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];
  
  routes.push({
    parentName: route,
    config: {
      basePath: 'organizations',
      routes: [
        {
          path: 'create',
          name: 'Create Organization',
          meta: {
            title: {
              en: 'Create Organization',
              ru: 'Создать Организацию',
            },
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: "organization-edit" */ '@martyrs/src/modules/organizations/components/pages/OrganizationEdit.vue'),
        },
        {
          path: ':_id',
          name: 'OrganizationRoot',
          meta: {
            title: {
              en: 'Group',
              ru: 'Группа',
            },
            sidebar_navigation_items: navigationItems,
          },
          children: [
            {
              path: '',
              name: 'Organization',
              meta: {
                title: {
                  en: 'Group',
                  ru: 'Группа',
                },
                breadcrumbs: {
                  hidden: true,
                },
              },
              component: () => import(/* webpackChunkName: "organization" */ '@martyrs/src/modules/organizations/components/pages/Organization.vue'),
            },
            {
              path: 'members',
              name: 'Organization Members',
              meta: {
                title: {
                  en: 'Members',
                  ru: 'Участники',
                },
              },
              component: () => import(/* webpackChunkName: "organization-members" */ '@martyrs/src/modules/organizations/components/pages/Members.vue'),
            },
            {
              path: 'members/invite',
              name: 'Invite Member',
              component: () => import(/* webpackChunkName: "organization-members-add" */ '@martyrs/src/modules/organizations/components/sections/MembersAdd.vue'),
            },
            {
              path: 'departments/:department',
              name: 'Department',
              meta: {
                title: 'Отдел',
              },
              beforeEnter: [validationAuth.requiresAuth],
              component: () => import(/* webpackChunkName: "organization-department" */ '@martyrs/src/modules/organizations/components/pages/Department.vue'),
            },
            {
              path: 'backoffice',
              component: layoutEmpty,
              children: [
                {
                  path: '',
                  name: 'Backoffice',
                  meta: {
                    title: {
                      en: 'Backoffice',
                      ru: 'Управление',
                    },
                    authorize: [],
                  },
                  component: () => import(/* webpackChunkName: "organization-backoffice" */ '@martyrs/src/modules/organizations/components/pages/OrganizationBackoffice.vue'),
                },
              ],
            },
          ],
        },
        {
          path: ':_id/edit',
          name: 'Organization Edit',
          meta: {
            title: {
              en: 'Edit Organization',
              ru: 'Редактировать Организацию',
            },
            sidebar_navigation_items: navigationItems,
          },
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: "organization-edit" */ '@martyrs/src/modules/organizations/components/pages/OrganizationEdit.vue'),
        },
      ],
      meta: {
        title: {
          en: 'Organizations',
          ru: 'Организации',
        },
        breadcrumbs: {
          hidden: true,
        },
      },
    }
  });
  
  return routes;
}