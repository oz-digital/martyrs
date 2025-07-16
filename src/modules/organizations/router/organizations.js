import backofficeRoutes from '@martyrs/src/modules/organizations/router/backoffice.router.js';
import departmentRoutes from './departments.router.js';
import membersRoutes from './members.router.js';

import { createEventRoutes } from '@martyrs/src/modules/events/router/events.js';
import { createRentsRoutes } from '@martyrs/src/modules/rents/views/router/rents.router.js';

import categoriesRoutes from '@martyrs/src/modules/products/router/categories.router.js';
import { createProductRoutes } from '@martyrs/src/modules/products/router/products.router.js';

import { createSpotsRoutes } from '@martyrs/src/modules/spots/router/spots.js';
import { createPostsRoutes } from '@martyrs/src/modules/community/router/blogposts.js';

import galleryBackofficeRoutes from '@martyrs/src/modules/gallery/router/gallery.backoffice.router.js';
import paymentsRoutes from '@martyrs/src/modules/wallet/views/router/payments.router.js';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

import SidebarOrganization from '@martyrs/src/modules/organizations/components/pages/OrganizationBackoffice.vue';
import { navigationItems } from '@martyrs/src/modules/organizations/configs/navigation.organization.config.js';

const organizations = {
  path: 'organizations',
  meta: {
    title: {
      en: 'Organizations',
      ru: 'Организации',
    },
    breadcrumbs: {
      hidden: true,
    },
  },
  children: [
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
      component: () => import('@martyrs/src/modules/organizations/components/pages/OrganizationEdit.vue'),
    },
    {
      path: ':_id',
      name: 'OrganizationRoot',
      meta: {
        title: {
          en: 'Group',
          ru: 'Группа',
        },
        // sidebar_navigation: SidebarOrganization,
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
          component: () => import('@martyrs/src/modules/organizations/components/pages/Organization.vue'),
        },
        ...membersRoutes,
        ...departmentRoutes,
        createProductRoutes('Organization_'),
        createEventRoutes('Organization_'),
        createRentsRoutes('Organization_'),
        createSpotsRoutes('Organization_'),
        createPostsRoutes('Organization_'),
        ...categoriesRoutes,
        ...paymentsRoutes,
        ...galleryBackofficeRoutes,
        ...backofficeRoutes,
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
      component: () => import('@martyrs/src/modules/organizations/components/pages/OrganizationEdit.vue'),
    },
  ],
};

export default organizations;
