// Use dynamic imports for better code splitting

const ordersRoutes = [
  {
    path: '',
    name: 'OrdersList',
    component: () => import(/* webpackChunkName: "orders" */ '@martyrs/src/modules/orders/components/pages/Orders.vue'),
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
    component: () => import(/* webpackChunkName: "orders" */ '@martyrs/src/modules/orders/components/pages/OrderCreate.vue'),
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
    component: () => import(/* webpackChunkName: "orders" */ '@martyrs/src/modules/orders/components/pages/OrderCreateBackoffice.vue'),
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
    component: () => import(/* webpackChunkName: "orders" */ '@martyrs/src/modules/orders/components/pages/OrderBackoffice.vue'),
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
    component: () => import(/* webpackChunkName: "orders" */ '@martyrs/src/modules/orders/components/pages/OrderBackoffice.vue'),
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
