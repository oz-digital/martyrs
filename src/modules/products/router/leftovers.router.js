const productRoutes = [
  {
    path: 'leftovers',
    name: 'Leftovers',
    meta: {
      title: {
        en: 'Leftovers',
        ru: 'Остатки',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'ProductsLeftovers' */ '@martyrs/src/modules/products/components/pages/Leftovers.vue'),
  },
  {
    path: 'leftovers/add',
    name: 'LeftoverAdd',
    meta: {
      title: {
        en: 'Leftovers Add',
        ru: 'Управление Остатками',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'LeftoverEdit' */ '@martyrs/src/modules/products/components/pages/LeftoverEdit.vue'),
  },
  {
    path: 'leftovers/:leftover',
    name: 'LeftoverEdit',
    meta: {
      title: {
        en: 'Leftovers Edit',
        ru: 'Управление Остатками',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'LeftoverEdit' */ '@martyrs/src/modules/products/components/pages/LeftoverEdit.vue'),
  },
];

export default productRoutes;
