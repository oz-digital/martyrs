// auth.meta.js
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';
import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue';
import { navigationItems } from '@martyrs/src/modules/auth/views/configs/navigation.user.config.js';
import ProfileCard from '@martyrs/src/modules/auth/views/components/blocks/ProfileCard.vue';
import HelpCard from '@martyrs/src/modules/core/views/components/blocks/HelpCard.vue';

const { isPhone, isTablet } = useGlobalMixins();

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];
  
  // Auth routes
  routes.push({
    parentName: route,
    config: {
      basePath: 'auth',
      component: () => import(/* webpackChunkName: "auth-layout" */ './views/components/layouts/Auth.vue'),
      meta: {
        title: {
          en: 'Аутентификация',
          ru: 'Authentication',
        },
      },
      routes: [
        {
          path: 'signin',
          name: 'Sign In',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.resetUser),
          ],
          meta: {
            title: {
              en: 'Sign In',
              ru: 'Вход',
            },
          },
          component: () => import(/* webpackChunkName: "signin" */ './views/components/pages/SignIn.vue'),
        },
        {
          path: 'reset-password',
          name: 'Reset Password',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.resetUser),
          ],
          meta: {
            title: {
              en: 'Reset Password',
              ru: 'Сбросить Пароль',
            },
          },
          component: () => import(/* webpackChunkName: "reset-password" */ './views/components/pages/ResetPassword.vue'),
        },
        {
          path: 'signup',
          name: 'Sign Up',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.resetUser),
          ],
          meta: {
            title: {
              en: 'Sign Up',
              ru: 'Регистрация',
            },
          },
          component: () => import(/* webpackChunkName: "signup" */ './views/components/pages/SignUp.vue'),
        },
        {
          path: 'enter-code',
          name: 'Enter Code',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.checkUser),
          ],
          meta: {
            title: {
              en: 'Enter Code',
              ru: 'Введите Код',
            },
          },
          component: () => import(/* webpackChunkName: "signup" */ './views/components/pages/EnterCode.vue'),
        },
        {
          path: 'enter-password',
          name: 'Enter Password',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.checkUser),
          ],
          meta: {
            title: {
              en: 'Enter Password',
              ru: 'Введите Пароль',
            },
          },
          component: () => import(/* webpackChunkName: "signup" */ './views/components/pages/EnterPassword.vue'),
        },
        {
          path: 'invite',
          name: 'Invite',
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.requiresNoAuth),
            () => import(/* webpackChunkName: "auth-validation" */ './views/middlewares/auth.validation.js').then(m => m.resetUser),
          ],
          meta: {
            title: {
              en: 'Invite',
              ru: 'Приглашение',
            },
          },
          component: () => import(/* webpackChunkName: "signup" */ './views/components/pages/Invite.vue'),
        },
      ],
    }
  });
  
  // Users routes
  routes.push({
    parentName: route,
    config: {
      basePath: 'users',
      meta: {
        title: {
          en: 'Users',
          ru: 'Пользователи',
        },
      },
      routes: [
        {
          path: ':_id',
          name: 'User Profile Root',
          meta: {
            title: {
              en: 'Profile',
              ru: 'Профиль',
            },
            sidebar_hover: false,
            sidebar_navigation_items: navigationItems,
            sidebar_header_component: ProfileCard,
            sidebar_footer_component: HelpCard,
            sidebarOpenOnEnter: true,
            sidebarCloseOnLeave: true
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
              component: () => import(/* webpackChunkName: "profile" */ './views/components/pages/Profile.vue'),
              children: [
                {
                  path: 'edit',
                  name: 'User Edit Profile',
                  component: () => import(/* webpackChunkName: "profile-edit" */ './views/components/pages/ProfileEdit.vue'),
                  children: [
                    {
                      path: 'profile',
                      name: 'Profile Edit Profile',
                      component: () => import(/* webpackChunkName: "profile-edit-profile" */ './views/components/pages/ProfileEditProfile.vue')
                    },
                    {
                      path: 'account', 
                      name: 'Profile Edit Account',
                      component: () => import(/* webpackChunkName: "profile-edit-account" */ './views/components/pages/ProfileEditAccount.vue')
                    }
                  ]
                }
              ]
            },
            {
              path: 'dashboard',
              name: 'User Dashboard',
              meta: {
                title: {
                  en: 'Dashboard',
                  ru: 'Дашборд',
                },
              },
              beforeEnter: [
                (to) => {
                  if (to.params._id !== auth.state.user._id) {
                    return { name: 'User Profile', params: { _id: to.params._id } };
                  }
                }
              ],
              component: () => import(/* webpackChunkName: "profile-dashboard" */ './views/components/pages/UserDashboard.vue'),
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
              component: () => import(/* webpackChunkName: "profile" */ './views/components/pages/ProfileBlogposts.vue'),
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
    }
  });
  
  return routes;
}