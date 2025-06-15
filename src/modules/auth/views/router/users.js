import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue';

const users = {
  path: 'users',
  name: 'Users',
  meta: {
    title: {
      en: 'Users',
      ru: 'Пользователи',
    },
  },
  children: [
    {
      path: ':_id',
      name: 'User Profile Root',
      meta: {
        title: {
          en: 'Profile',
          ru: 'Профиль',
        },
      },
      children: [
        {
          path: '', // Пустой путь для основного профиля
          name: 'User Profile',
          meta: {
            title: {
              en: 'Profile',
              ru: 'Профиль',
            },
            title_hide: true,
            hideNavigationBar: route => route.params._id === auth.state.user._id,
          },
          component: () => import(/* webpackChunkName: "profile" */ '../components/pages/Profile.vue'),
        },
        {
          path: 'edit',
          name: 'User Edit Profile',
          beforeEnter: [validationAuth.requiresAuth],
          meta: {
            title: {
              en: 'Edit Profile',
              ru: 'Редактировать Профиль',
            },
          },
          component: () => import(/* webpackChunkName: "profile" */ '../components/pages/ProfileEdit.vue'),
        },
        {
          path: 'blogposts',
          name: 'User Posts',
          meta: {
            title: {
              en: 'Posts',
              ru: 'Посты',
            },
          },
          component: () => import(/* webpackChunkName: "profile" */ '../components/pages/ProfileBlogposts.vue'),
        },
        {
          path: 'events',
          name: 'User Events',
          meta: {
            title: {
              en: 'Events',
              ru: 'События',
            },
          },
          component: () => import(/* webpackChunkName: "profile" */ '@martyrs/src/modules/events/components/pages/EventsBackoffice.vue'),
        },
        {
          path: 'organizations',
          name: 'User Organizations',
          meta: {
            title: {
              en: 'Groups',
              ru: 'Группы',
            },
            actions: [
              {
                component: IconPlus,
                props: {
                  fill: 'rgb(var(--main))',
                },
                condition: () => auth.state.user && auth.state.user._id,
                action: router => router.push({ name: 'Create Organization' }),
              },
            ],
          },
          component: () => import(/* webpackChunkName: "profile" */ '@martyrs/src/modules/organizations/components/pages/Organizations.vue'),
        },
        {
          path: 'wallet',
          name: 'User Wallet',
          meta: {
            title: {
              en: 'Wallet',
              ru: 'Кошелек',
            },
          },
          component: () => import(/* webpackChunkName: "profile" */ '@martyrs/src/modules/wallet/views/components/pages/Wallet.vue'),
        },
      ],
    },
  ],
};

export default users;
