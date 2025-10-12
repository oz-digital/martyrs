function createInventoryRoutes() {
  return [
    {
      path: '',
      name: 'InventoryList',
      meta: {
        title: {
          en: 'Inventory',
          ru: 'Инвентарь',
        },
        authorize: [],
      },
      component: () => import(/* webpackChunkName: 'inventory-list' */ './components/pages/Inventory.vue'),
    },
    {
      path: 'audit',
      name: 'InventoryAudit',
      meta: {
        title: {
          en: 'Create Inventory Audit',
          ru: 'Создать Инвентаризацию',
        },
        authorize: [],
      },
      component: () => import(/* webpackChunkName: 'inventory-audit' */ './components/pages/InventoryEdit.vue'),
    },
  ];
}

export function getRoutes(options = {}) {
  const routes = [];
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'inventory',
        routes: createInventoryRoutes(),
        routeNamePrefix: options.backofficeRouteNamePrefix || 'Backoffice',
        filterConfig: {
          include: ['InventoryList', 'InventoryAudit'],
        },
        meta: {
          context: 'backoffice',
        },
      },
    });
  }

  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: options.organizationBasePath || 'inventory',
        routes: createInventoryRoutes(),
        routeNamePrefix: options.organizationRouteNamePrefix || 'Organization',
        filterConfig: {
          include: ['InventoryList', 'InventoryAudit'],
        },
        meta: {
          context: 'organization',
        },
      },
    });
  }

  return routes;
}

export default { getRoutes };
