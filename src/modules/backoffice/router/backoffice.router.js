// backoffice.meta.js
import Sidebar from '../components/partials/Sidebar.vue';

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];
  
  routes.push({
    parentName: route,
    config: {
      basePath: 'backoffice',
      routes: [
        {
          path: '',
          name: 'Backoffice Root',
          meta: {
            sidebar_navigation: Sidebar,
            sidebar_width_hidden: 'w-0',
          },
          props: {
            newsletterPopup: 12344,
          },
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ '@martyrs/src/modules/auth/views/middlewares/auth.validation.js').then(m => m.requiresAdmin),
          ],
          children: [
            {
              path: '',
              name: 'Backoffice Admin',
              meta: {
                title: {
                  en: 'Backoffice',
                  ru: 'Управление',
                },
              },
              component: () => import(/* webpackChunkName: 'BackofficeGallery' */ '../components/pages/Dashboard.vue'),
            },
            {
              path: 'organizations',
              name: 'Backoffice Organizations',
              meta: {
                title: {
                  en: 'Backoffice Organizations',
                  ru: 'Управление Организациями',
                },
                authorize: [],
              },
              component: () => import(/* webpackChunkName: 'BackofficeOrganizations' */ '@martyrs/src/modules/organizations/components/pages/Organizations.vue'),
            },
            {
              path: 'community',
              name: 'Backoffice Community',
              meta: {
                title: {
                  en: 'Backoffice Community',
                  ru: 'Управление Сообществом',
                },
                authorize: [],
              },
              component: () => import(/* webpackChunkName: 'BackofficeCommunity' */ '@martyrs/src/modules/community/components/pages/Blog.vue'),
            },
          ],
        }
      ],
    }
  });
  
  return routes;
}