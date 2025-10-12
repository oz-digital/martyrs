function buildMarketplaceTree(options = {}) {
  const layoutComponent = options.layoutComponent || (() => import(
    /* webpackChunkName: 'marketplace-layout' */
    './views/components/layouts/Marketplace.vue'
  ));
  const catalogComponent = options.catalogComponent || (() => import(
    /* webpackChunkName: 'marketplace-catalog' */
    './views/components/pages/Catalog.vue'
  ));

  const buildName = (suffix) => {
    const prefix = options.routeNamePrefix || '';
    return suffix ? `${prefix}${suffix}` : prefix || undefined;
  };

  return [
    {
      path: '',
      name: buildName('Marketplace') || 'Marketplace',
      component: layoutComponent,
      meta: {
        title: {
          en: 'Marketplace',
          ru: 'Маркетплейс',
        },
      },
      children: [
        {
          path: ':country?',
          component: catalogComponent,
          children: [
            {
              path: ':state?',
              name: buildName('State') || 'State',
              component: catalogComponent,
              children: [
                {
                  path: ':city?',
                  name: buildName('City') || 'City',
                  component: catalogComponent,
                },
              ],
            },
          ],
        },
      ],
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
