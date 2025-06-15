const payments = [
  {
    path: 'payments',
    name: 'Payments',
    meta: {
      title: {
        en: 'Payments',
        ru: 'Платежами',
      },
      authorize: [],
    },
    component: () => import(/* webpackChunkName: 'Payments' */ '@martyrs/src/modules/wallet/views/components/pages/Payments.vue'),
    children: [
      {
        path: 'create',
        name: 'PaymentsCreate',
        meta: {
          title: {
            en: 'Create Payment',
            ru: 'Создать платеж',
          },
          authorize: [],
        },
        component: () => import(/* webpackChunkName: 'Payments' */ '@martyrs/src/modules/wallet/views/components/pages/Payments.vue'),
        children: [],
      },
    ],
  },
];

export default payments;
