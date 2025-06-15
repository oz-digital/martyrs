import OrderBackoffice from '@martyrs/src/modules/orders/components/pages/OrderBackoffice.vue';
import OrderCreate from '@martyrs/src/modules/orders/components/pages/OrderCreate.vue';
import OrderCreateBackoffice from '@martyrs/src/modules/orders/components/pages/OrderCreateBackoffice.vue';
import Orders from '@martyrs/src/modules/orders/components/pages/Orders.vue';

const ordersRoutes = [
  {
    path: '',
    name: 'OrdersList',
    component: Orders,
    meta: {
      title: {
        en: 'Orders',
        ru: 'Заказы',
      },
    },
  },
  {
    path: 'form',
    name: 'CreateOrder',
    component: OrderCreate,
    meta: {
      title: {
        en: 'Create Order',
        ru: 'Создать Заказ',
      },
    },
  },
  {
    path: 'add',
    name: 'AdminCreateOrder',
    component: OrderCreateBackoffice,
    meta: {
      title: {
        en: 'Add Order',
        ru: 'Добавить Заказ',
      },
    },
  },
  {
    path: ':order',
    name: 'Order',
    component: OrderBackoffice,
    props: route => ({
      mode: route.matched[0].meta.context === 'backoffice' ? 'edit' : 'view',
    }),
    meta: {
      title: {
        en: 'Order',
        ru: 'Заказ',
      },
    },
  },
  {
    path: ':order/edit',
    name: 'OrderEdit',
    component: OrderBackoffice,
    props: { mode: 'edit' },
    meta: {
      title: {
        en: 'Edit Order',
        ru: 'Редактировать Заказ',
      },
    },
  },
];

export default ordersRoutes;
