function buildMarketplaceTree(options = {}) {
  const marketplaceComponent = options.marketplaceComponent || (() => import(
    /* webpackChunkName: 'marketplace-page' */
    '../components/pages/Marketplace.vue'
  ));

  const buildName = (suffix) => {
    const prefix = options.routeNamePrefix || '';
    return suffix ? `${prefix}${suffix}` : prefix || undefined;
  };

  return [
    {
      path: ':country?/:state?/:city?',
      name: buildName('Marketplace') || 'Marketplace',
      component: marketplaceComponent,
      meta: {
        title: {
          en: 'Marketplace',
          ru: 'Маркетплейс',
        },
      },
    },
  ];
}

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];

  routes.push({
    parentName: route,
    config: {
      basePath: options.basePath || 'marketplace',
      routes: buildMarketplaceTree(options),
    },
  });

  return routes;
}

export default { getRoutes };
