import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const departmentRoutes = [
  {
    path: 'departments/create',
    name: 'Department Creation',
    meta: {
      title: 'Создание отдела',
    },
    beforeEnter: [validationAuth.requiresAuth],
    component: () => import('@martyrs/src/modules/organizations/components/pages/DepartmentEdit.vue'),
  },
  {
    path: 'departments/:department',
    name: 'Department',
    meta: {
      title: 'Отдел',
    },
    beforeEnter: [validationAuth.requiresAuth],
    component: () => import('@martyrs/src/modules/organizations/components/pages/Department.vue'),
  },
  {
    path: 'departments/:department/edit',
    name: 'Department Edit',
    meta: {
      title: 'Редактирование отдела',
    },
    beforeEnter: [validationAuth.requiresAuth],
    component: () => import('@martyrs/src/modules/organizations/components/pages/DepartmentEdit.vue'),
  },
];

export default departmentRoutes;
