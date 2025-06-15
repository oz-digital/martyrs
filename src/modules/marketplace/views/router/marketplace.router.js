import layoutMarketplace from '../components/layouts/Marketplace.vue';

const marketplace = {
  path: 'marketplace',
  component: layoutMarketplace,
  name: 'Marketplace',
  meta: {
    title: {
      en: 'Marketplace',
      ru: 'Маркетплейс',
    },
  },
  children: [
    {
      path: ':country?',
      component: () => import(/* webpackChunkName: 'Deliveries' */ '../components/pages/Catalog.vue'),
      children: [
        {
          path: ':state?',
          name: 'State',
          component: () => import(/* webpackChunkName: 'Deliveries' */ '../components/pages/Catalog.vue'),
          children: [
            {
              path: ':city?',
              name: 'City',
              component: () => import(/* webpackChunkName: 'Deliveries' */ '../components/pages/Catalog.vue'),
            },
          ],
        },
      ],
    },
  ],
};

export default marketplace;
