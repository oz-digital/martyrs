import Sidebar from '../components/partials/Sidebar.vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

// const admin = [
//   {
//     path: 'admin',
//     component: layoutAdmin,
//     meta: { authorize: ["ROLE_MODERATOR"] },
//     children: [{
//       path: 'backcalls',
//       name: 'Backcalls',
//       // meta: { authorize: ["ROLE_MODERATOR"] },
//       component: () => import(/* webpackChunkName: 'Backcalls' */ '@/components/pages/admin/Backcalls.vue')
//     },{
//       path: 'fastorder',
//       name: 'FastOrders',
//       // meta: { authorize: ["ROLE_MODERATOR"] },
//       component: () => import(/* webpackChunkName: 'FastOrders' */ '@/components/pages/admin/FastOrders.vue')
//     },{
//       path: 'users',
//       name: 'Users',
//       component: () => import(/* webpackChunkName: 'Users' */ '@/components/pages/admin/Users.vue')
//     },{
//       path: 'users/:phone',
//       name: 'User',
//       component: () => import(/* webpackChunkName: 'User' */ '@/components/pages/admin/User.vue')
//     }]
//   }
// ];

const backofficeRoutes = {
  path: 'backoffice',
  name: 'Backoffice Root',

  meta: {
    sidebar_navigation: Sidebar,
    sidebar_width_hidden: 'w-0',
  },

  props: {
    newsletterPopup: 12344,
  },

  beforeEnter: [validationAuth.requiresAdmin],
  children: [
    {
      path: '',
      name: 'Backoffice Admin',
      meta: {
        title: {
          en: 'Backoffice',
          ru: 'Управление',
        },
      },
      component: () => import(/* webpackChunkName: 'BackofficeGallery' */ '../components/pages/Dashboard.vue'),
    },
    {
      path: 'reports',
      name: 'Backoffice Reports',
      meta: {
        title: {
          en: 'Backoffice Reports',
          ru: 'Управление Жалобами',
        },
      },
      component: () => import(/* webpackChunkName: 'BackofficeGallery' */ '@martyrs/src/modules/reports/components/pages/BackofficeReports.vue'),
    },
    {
      path: 'organizations',
      name: 'Backoffice Organizations',
      meta: {
        title: {
          en: 'Backoffice Organizations',
          ru: 'Управление Организациями',
        },
        authorize: [],
      },
      component: () => import(/* webpackChunkName: 'BackofficeOrganizations' */ '@martyrs/src/modules/organizations/components/pages/Organizations.vue'),
    },
    {
      path: 'community',
      name: 'Backoffice Community',
      meta: {
        title: {
          en: 'Backoffice Community',
          ru: 'Управление Сообществом',
        },
        authorize: [],
      },
      component: () => import(/* webpackChunkName: 'BackofficeCommunity' */ '@martyrs/src/modules/community/components/pages/Blog.vue'),
    },
  ],
};

export default backofficeRoutes;
