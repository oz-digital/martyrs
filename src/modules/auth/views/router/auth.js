import layoutAuth from '../components/layouts/Auth.vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const auth = {
  path: 'auth',
  name: 'Authentication',
  meta: {
    title: {
      en: 'Аутентификация',
      ru: 'Authentication',
    },
  },
  component: layoutAuth,
  children: [
    {
      path: 'signin',
      name: 'Sign In',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.resetUser],
      meta: {
        title: {
          en: 'Sign In',
          ru: 'Вход',
        },
      },
      component: () => import(/* webpackChunkName: "signin" */ '../components/pages/SignIn.vue'),
    },
    {
      path: 'reset-password',
      name: 'Reset Password',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.resetUser],
      meta: {
        title: {
          en: 'Reset Password',
          ru: 'Сбросить Пароль',
        },
      },
      component: () => import(/* webpackChunkName: "reset-password" */ '../components/pages/ResetPassword.vue'),
    },
    {
      path: 'signup',
      name: 'Sign Up',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.resetUser],
      meta: {
        title: {
          en: 'Sign Up',
          ru: 'Регистрация',
        },
      },
      component: () => import(/* webpackChunkName: "signup" */ '../components/pages/SignUp.vue'),
    },
    {
      path: 'enter-code',
      name: 'Enter Code',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.checkUser],
      meta: {
        title: {
          en: 'Enter Code',
          ru: 'Введите Код',
        },
      },
      component: () => import(/* webpackChunkName: "signup" */ '../components/pages/EnterCode.vue'),
    },
    {
      path: 'enter-password',
      name: 'Enter Password',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.checkUser],
      meta: {
        title: {
          en: 'Enter Password',
          ru: 'Введите Пароль',
        },
      },
      component: () => import(/* webpackChunkName: "signup" */ '../components/pages/EnterPassword.vue'),
    },
    {
      path: 'invite',
      name: 'Invite',
      beforeEnter: [validationAuth.requiresNoAuth, validationAuth.resetUser],
      meta: {
        title: {
          en: 'Invite',
          ru: 'Приглашение',
        },
      },
      component: () => import(/* webpackChunkName: "signup" */ '../components/pages/Invite.vue'),
    },
  ],
};

export default auth;
