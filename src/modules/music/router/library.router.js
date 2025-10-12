export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];

  routes.push({
    parentName: route,
    config: {
      basePath: 'music',
      routes: [
        {
          path: 'library',
          name: 'music-library',
          component: () => import(/* webpackChunkName: 'music-library' */ '../components/pages/MusicLibrary.vue'),
          meta: {
            title: 'My Library',
            requiresAuth: true,
          },
        },
      ],
    },
  });

  return routes;
}

export default { getRoutes };
