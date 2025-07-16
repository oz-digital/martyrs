const applicationsRoutes = [
  {
    path: '',
    name: 'Applications', 
    component: () => import('@martyrs/src/modules/orders/components/pages/Applications.vue'),
    meta: {
      title: {
        en: 'Applications',
        ru: 'Заявки',
      },
    },
  },
];

export default applicationsRoutes;