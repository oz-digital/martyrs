import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const departmentRoutes = [
  {
    path: 'departments/:department',
    name: 'Department',
    meta: {
      title: 'Отдел',
    },
    beforeEnter: [validationAuth.requiresAuth],
    component: () => import('@martyrs/src/modules/organizations/components/pages/Department.vue'),
  },
];

export default departmentRoutes;
