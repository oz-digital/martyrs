import layoutEmpty from '@martyrs/src/modules/core/views/components/layouts/Empty.vue';

const backofficeRoutes = [
  {
    path: 'backoffice',
    component: layoutEmpty,
    // beforeEnter: [
    //   validationAuth.requiresAdmin,
    // ],
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
        component: () => import(/* webpackChunkName: 'Organizations' */ '@martyrs/src/modules/organizations/components/pages/OrganizationBackoffice.vue'),
      },
    ],
  },
];

export default backofficeRoutes;
