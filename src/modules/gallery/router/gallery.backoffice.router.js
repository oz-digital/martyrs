import * as validationOwnership from '@martyrs/src/modules/auth/views/middlewares/ownership.validation.js';

const gallery = [
  {
    path: 'gallery',
    name: 'Backoffice Gallery',
    meta: {
      title: {
        en: 'Backoffice Gallery',
        ru: 'Управление Галерей',
      },
    },
    beforeEnter: [validationOwnership.requiresAccess('gallery', 'read')],
    component: () => import(/* webpackChunkName: 'BackofficeGallery' */ '@martyrs/src/modules/gallery/components/sections/BackofficeGallery.vue'),
  },
];

export default gallery;
