import layoutCommunity from '../components/layouts/Community.vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const community = {
  path: 'community',
  component: layoutCommunity,
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
  children: [
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
      beforeEnter: [validationAuth.requiresAuth],
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
      beforeEnter: [
        validationAuth.requiresAuth,
        // validationOwnership.requiresEditAccess
      ],
      component: () => import(/* webpackChunkName: 'CreateBlogPost' */ '../components/pages/CreateBlogPost.vue'),
    },
  ],
};

export default community;
