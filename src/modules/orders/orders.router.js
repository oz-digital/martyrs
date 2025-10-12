// Meta-файл для регистрации роутов модуля orders
// Содержит полное описание всех роутов с lazy-loading компонентов

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';
  const routeUsers = options.routeUsers || 'User Profile Root';
  
  const routes = [];
  
  // 1. Orders в Home - публичные роуты для создания заказа
  routes.push({
    parentName: route,
    config: {
      basePath: 'orders',
      routes: [
        {
          path: 'form',
          name: 'CreateOrder',
          component: () => import(/* webpackChunkName: "orders-create" */ './components/pages/OrderCreate.vue'),
          meta: {
            title: { en: 'Create Order', ru: 'Создать Заказ' },
            context: 'root'
          }
        },
        {
          path: ':order',
          name: 'Order',
          component: () => import(/* webpackChunkName: "orders-view" */ './components/pages/OrderBackoffice.vue'),
          props: route => ({
            mode: 'view',
            orderId: route.params.order
          }),
          meta: {
            title: { en: 'Order', ru: 'Заказ' },
            context: 'root'
          }
        }
      ]
    }
  });
  
  // 2. Orders в Backoffice - административные функции
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'orders',
        routes: [
          {
            path: '',
            name: 'BackofficeOrdersList',
            component: () => import(/* webpackChunkName: "orders-list" */ './components/pages/Orders.vue'),
            meta: {
              title: { en: 'Orders', ru: 'Заказы' },
              context: 'backoffice'
            }
          },
          {
            path: 'add',
            name: 'BackofficeAdminCreateOrder',
            component: () => import(/* webpackChunkName: "orders-backoffice-create" */ './components/pages/OrderCreateBackoffice.vue'),
            meta: {
              title: { en: 'Add Order', ru: 'Добавить Заказ' },
              context: 'backoffice'
            }
          },
          {
            path: ':order',
            name: 'BackofficeOrder',
            component: () => import(/* webpackChunkName: "orders-backoffice" */ './components/pages/OrderBackoffice.vue'),
            props: route => ({
              mode: 'edit',
              orderId: route.params.order
            }),
            meta: {
              title: { en: 'Order', ru: 'Заказ' },
              context: 'backoffice'
            }
          },
        ]
      }
    });
  }
  
  // 3. Orders в User Profile - личные заказы пользователя
  if (!options.withUserRoutes) {
    routes.push({
      parentName: routeUsers,
      config: {
        basePath: 'orders',
        routes: [
          {
            path: '',
            name: 'UserOrdersList',
            component: () => import(/* webpackChunkName: "orders-list" */ './components/pages/Orders.vue'),
            props: () => ({ userOnly: true }),
            meta: {
              title: { en: 'My Orders', ru: 'Мои Заказы' },
              context: 'user'
            }
          },
          {
            path: ':order',
            name: 'UserOrder',
            component: () => import(/* webpackChunkName: "orders-view" */ './components/pages/OrderBackoffice.vue'),
            props: route => ({
              mode: 'view',
              orderId: route.params.order
            }),
            meta: {
              title: { en: 'Order Details', ru: 'Детали Заказа' },
              context: 'user'
            }
          }
        ]
      }
    });
  }
  
  // 4. Orders в Organizations - заказы организации
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: 'orders',
        routes: [
          {
            path: '',
            name: 'OrganizationOrdersList',
            component: () => import(/* webpackChunkName: "orders-list" */ './components/pages/Orders.vue'),
            props: () => ({ organizationMode: true }),
            meta: {
              title: { en: 'Organization Orders', ru: 'Заказы Организации' },
              context: 'organization'
            }
          },
          {
            path: 'add',
            name: 'OrganizationAdminCreateOrder',
            component: () => import(/* webpackChunkName: "orders-org-create" */ './components/pages/OrderCreateBackoffice.vue'),
            props: () => ({ organizationMode: true }),
            meta: {
              title: { en: 'Create Order', ru: 'Создать Заказ' },
              context: 'organization'
            }
          },
          {
            path: ':order',
            name: 'OrganizationOrder',
            component: () => import(/* webpackChunkName: "orders-org-view" */ './components/pages/OrderBackoffice.vue'),
            props: route => ({
              mode: 'edit',
              orderId: route.params.order,
              organizationMode: true
            }),
            meta: {
              title: { en: 'Order', ru: 'Заказ' },
              context: 'organization'
            }
          },
        ]
      }
    });
  }
  
  // 5. Customers в Backoffice
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'customers',
        routes: [
          {
            path: '',
            name: 'BackofficeCustomers',
            component: () => import(/* webpackChunkName: "customers" */ './components/pages/Customers.vue'),
            meta: {
              title: { en: 'Customers', ru: 'Клиенты' },
              context: 'backoffice'
            }
          }
        ]
      }
    });
  }
  
  // 6. Customers в Organizations
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: 'customers',
        routes: [
          {
            path: '',
            name: 'OrganizationCustomers',
            component: () => import(/* webpackChunkName: "customers" */ './components/pages/Customers.vue'),
            props: () => ({ organizationMode: true }),
            meta: {
              title: { en: 'Customers', ru: 'Клиенты' },
              context: 'organization'
            }
          }
        ]
      }
    });
  }
  
  // 7. Applications в Backoffice
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'applications',
        routes: [
          {
            path: '',
            name: 'BackofficeApplications',
            component: () => import(/* webpackChunkName: "applications" */ './components/pages/Applications.vue'),
            meta: {
              title: { en: 'Applications', ru: 'Заявки' },
              context: 'backoffice'
            }
          }
        ]
      }
    });
  }
  
  // 8. Applications в Organizations
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: 'applications',
        routes: [
          {
            path: '',
            name: 'OrganizationApplications',
            component: () => import(/* webpackChunkName: "applications" */ './components/pages/Applications.vue'),
            props: () => ({ organizationMode: true }),
            meta: {
              title: { en: 'Applications', ru: 'Заявки' },
              context: 'organization'
            }
          }
        ]
      }
    });
  }
  
  return routes;
}