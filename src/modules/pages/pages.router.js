import layoutEmpty from '@martyrs/src/modules/core/views/components/layouts/Empty.vue';
import Sidebar from '@martyrs/src/modules/backoffice/components/partials/Sidebar.vue';
import SidebarPages from './views/components/partials/SidebarPages.vue';

function createPublicRoutes(options = {}) {
  return [
    {
      path: ':url+',
      name: options.publicRouteName || 'Page',
      meta: {
        title: {
          en: 'Page',
          ru: 'Страница',
        },
      },
      component: () => import(
        /* webpackChunkName: 'Page' */
        './views/components/pages/Page.vue'
      ),
    },
  ];
}

function createBackofficeRoutes(options = {}) {
  return [
    {
      path: '',
      name: 'Pages',
      component: () => import(
        /* webpackChunkName: 'Pages' */
        './views/components/pages/Pages.vue'
      ),
    },
    {
      path: 'add',
      name: 'Pages Add',
      meta: {
        title: {
          en: 'New Page',
        },
        sidebar: SidebarPages,
      },
      component: () => import(
        /* webpackChunkName: 'Pages' */
        './views/components/pages/PageEdit.vue'
      ),
    },
    {
      path: ':url+',
      name: 'Pages Edit',
      meta: {
        title: {
          en: 'Edit Page',
        },
        sidebar: SidebarPages,
      },
      component: () => import(
        /* webpackChunkName: 'Pages' */
        './views/components/pages/PageEdit.vue'
      ),
    },
  ];
}

export function getRoutes(options = {}) {
  const routes = [];
  const routeHome = options.route?.home || options.routeHome || 'Home';
  const routeBackoffice = options.route?.backoffice || options.routeBackoffice || 'Backoffice Root';

  routes.push({
    parentName: routeHome,
    config: {
      basePath: options.publicBasePath || 'pages',
      component: options.publicLayout || layoutEmpty,
      meta: {
        title: {
          en: 'Pages',
          ru: 'Информация',
        },
      },
      routes: createPublicRoutes(options),
    },
  });

  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'pages',
        routeNamePrefix: options.backofficeRouteNamePrefix || 'Backoffice ',
        meta: {
          title: {
            en: 'Pages',
          },
          sidebar: Sidebar,
        },
        routes: createBackofficeRoutes(options),
      },
    });
  }

  return routes;
}

export default { getRoutes };
