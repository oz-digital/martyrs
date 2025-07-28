import Customers from '@martyrs/src/modules/orders/components/pages/Customers.vue';

const customersRoutes = [
  {
    path: '',
    name: 'Customers',
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