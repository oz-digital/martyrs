import Customers from '@martyrs/src/modules/orders/components/pages/Customers.vue';

const customersRoutes = [
  {
    path: '',
    name: 'CustomersList',
    component: Customers,
    meta: {
      title: {
        en: 'Customers',
        ru: 'Клиенты',
      },
    },
  },
];

export default customersRoutes;