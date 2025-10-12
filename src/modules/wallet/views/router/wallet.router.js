// wallet.meta.js
// Meta-файл для регистрации роутов модуля wallet

export function getRoutes(options = {}) {
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';
  
  const routes = [];
  
  // Payments в Organizations - управление платежами организации
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: 'payments',
        name: 'Payments',
        meta: {
          title: {
            en: 'Payments',
            ru: 'Платежами',
          },
          authorize: [],
          context: 'organization',
        },
        component: () => import(/* webpackChunkName: 'payments' */ '../components/pages/Payments.vue'),
        routes: [
          {
            path: 'create',
            name: 'PaymentsCreate',
            meta: {
              title: {
                en: 'Create Payment',
                ru: 'Создать платеж',
              },
              authorize: [],
              context: 'organization',
            },
            component: () => import(/* webpackChunkName: 'payments-create' */ '../components/pages/Payments.vue'),
          },
        ],
      }
    });
  }
  
  return routes;
}