// icons.router.js
export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];

  routes.push({
    parentName: route,
    config: {
      basePath: 'icons',
      routes: [
        {
          path: '',
          name: 'Icons Gallery',
          meta: {
            title: {
              en: 'Icons',
              ru: 'Иконки',
            },
          },
          component: () => import(/* webpackChunkName: "icons" */ '../pages/IconsPage.vue'),
        },
      ],
    }
  });

  return routes;
}

export default { getRoutes };
