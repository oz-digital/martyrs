export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';
  const routes = [];
  
  // Основные роуты community в Home
  routes.push({
    parentName: route,
    config: {
      basePath: 'community',
      component: () => import(/* webpackChunkName: "community-layout" */ '../components/layouts/Community.vue'),
      meta: {
        title: {
          en: 'Community',
          ru: 'Коммьюнити',
        },
        breadcrumbs: {
          hidden: true,
        },
        title_hide: true,
      },
      routes: [
        {
          path: ':category?',
          name: 'Blog',
          meta: {
            title: {
              en: 'Community',
              ru: 'Коммьюнити',
            },
            title_hide: true,
            hideNavigationBar: true,
          },
          component: () => import(/* webpackChunkName: 'Blog' */ '../components/pages/Blog.vue'),
        },
        {
          path: 'posts/create',
          name: 'Create BlogPost',
          meta: {
            title: {
              en: 'Create Post',
              ru: 'Создать Пост',
            },
          },
          beforeEnter: async (to, from, next) => {
            const { requiresAuth } = await import('@martyrs/src/modules/auth/views/middlewares/auth.validation.js');
            return requiresAuth(to, from, next);
          },
          component: () => import(/* webpackChunkName: 'CreateBlogPost' */ '../components/pages/CreateBlogPost.vue'),
        },
        {
          path: 'posts/:url',
          name: 'BlogPost',
          meta: {
            title: {
              en: 'Post',
              ru: 'Пост',
            },
            title_hide: false,
          },
          component: () => import(/* webpackChunkName: 'BlogPost' */ '../components/pages/BlogPost.vue'),
        },
        {
          path: 'posts/:url/edit',
          name: 'Edit BlogPost',
          meta: {
            title: {
              en: 'Edit Post',
              ru: 'Редактировать пост',
            },
          },
          beforeEnter: async (to, from, next) => {
            const { requiresAuth } = await import('@martyrs/src/modules/auth/views/middlewares/auth.validation.js');
            return requiresAuth(to, from, next);
          },
          component: () => import(/* webpackChunkName: 'CreateBlogPost' */ '../components/pages/CreateBlogPost.vue'),
        },
      ],
    }
  });
  
  // Posts для Organizations
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: 'posts',
        routes: [
          {
            path: '',
            name: 'OrganizationPosts',
            meta: {
              title: {
                en: 'Posts',
                ru: 'Посты',
              },
              context: 'organization'
            },
            component: () => import(/* webpackChunkName: "organization-posts" */ '../components/pages/Posts.vue'),
          }
        ]
      }
    });
  }
  
  return routes;
}