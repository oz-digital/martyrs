import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const categoriesRoutes = [
  {
    path: 'categories',
    name: 'Categories',
    meta: {
      title: {
        en: 'Categories',
        ru: 'Категории',
      },
    },
    component: () => import('@martyrs/src/modules/products/components/pages/Categories.vue'),
  },
  {
    path: 'categories/add',
    name: 'Category Add',
    meta: {
      title: {
        en: 'Add Category',
        ru: 'Добавить Категорию',
      },
    },
    component: () => import('@martyrs/src/modules/products/components/pages/CategoryEdit.vue'),
  },
  {
    path: 'categories/:category/edit',
    name: 'Category Edit',
    meta: {
      title: {
        en: 'Edit Category',
        ru: 'Редактировать Категорию',
      },
    },
    beforeEnter: [validationAuth.requiresAuth],
    component: () => import('@martyrs/src/modules/products/components/pages/CategoryEdit.vue'),
  },
];

export default categoriesRoutes;
