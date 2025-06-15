import layoutEmpty from '@martyrs/src/modules/globals/views/components/layouts/Empty.vue';
import layoutSpots from '../components/layouts/Spots.vue';

import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

const spots = {
  path: 'spots',
  component: layoutEmpty,
  meta: {
    title: {
      en: 'Spots',
      ru: 'Места',
    },
    breadcrumbs: {
      hide: true,
      hidden: true,
    },
  },
  children: [
    {
      path: ':country?',
      component: layoutSpots,
      meta: {
        title: {
          en: 'Spots',
          ru: 'Места',
        },
        header_theme: 'dark',
        footer_theme: 'dark',
      },
      children: [
        {
          path: ':state?',
          name: 'Spots tate',
          component: () => import(/* webpackChunkName: 'Deliveries' */ '../components/pages/Map.vue'),
          children: [
            {
              path: ':city?',
              name: 'Spots City',
              component: () => import(/* webpackChunkName: 'Deliveries' */ '../components/pages/Map.vue'),
            },
          ],
        },
      ],
    },
    {
      path: ':_id/spots/create',
      name: 'Spot Creation',
      meta: {
        title: 'Создание точки',
      },
      beforeEnter: [validationAuth.requiresAuth],
      component: () => import(/* webpackChunkName: "spot" */ '@martyrs/src/modules/spots/components/pages/SpotEdit.vue'),
    },
    {
      path: ':_id/spots/:spot',
      name: 'Spot',
      meta: {
        title: 'Точка',
      },
      beforeEnter: [validationAuth.requiresAuth],
      component: () => import(/* webpackChunkName: "spot" */ '@martyrs/src/modules/spots/components/pages/Spot.vue'),
    },
    {
      path: ':_id/spots/:spot/edit',
      name: 'Spot Edit',
      meta: {
        title: 'Редактирование точки',
      },
      beforeEnter: [validationAuth.requiresAuth],
      component: () => import(/* webpackChunkName: "spot" */ '@martyrs/src/modules/spots/components/pages/SpotEdit.vue'),
    },
  ],
};

export default spots;
