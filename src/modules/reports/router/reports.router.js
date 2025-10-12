// reports.meta.js
// Meta-файл для регистрации роутов модуля reports

export function getRoutes(options = {}) {
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routes = [];
  
  // Reports в Backoffice - управление жалобами
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'reports',
        routes: [
          {
            path: '',
            name: 'Backoffice Reports',
            meta: {
              title: {
                en: 'Backoffice Reports',
                ru: 'Управление Жалобами',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: 'backoffice-reports' */ '../components/pages/BackofficeReports.vue'),
          }
        ]
      }
    });
  }
  
  return routes;
}