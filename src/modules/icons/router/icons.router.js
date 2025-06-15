// Router configuration for the icons module

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const iconsRouter = {
  path: 'icons',
  meta: {
    title: {
      en: 'Icons Gallery',
      ru: 'Галерея иконок'
    },
    breadcrumbs: {
      hidden: false,
    }
  },
  children: [
    {
      path: '',
      name: 'Icons',
      meta: {
        title: {
          en: 'Icons Gallery',
          ru: 'Галерея иконок'
        },
        breadcrumbs: {
          hidden: false,
        }
      },
      component: () => import('@martyrs/src/modules/icons/pages/IconsPage.vue')
    }
  ]
};

export default iconsRouter;