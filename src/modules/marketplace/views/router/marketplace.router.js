import layoutMarketplace from '../components/layouts/Marketplace.vue';

const marketplace = [
  {
    path: 'marketplace',
    name: 'Marketplace',
    component: () => import(/* webpackChunkName: 'layoutMarketplace' */ '../components/layouts/Marketplace.vue'),
    meta: {
      title: {
        en: 'Marketplace',
        ru: 'Маркетплейс',
      },
    },
  },
  {
    path: 'marketplace/:country',
    name: 'MarketplaceCountry',
    component: () => import(/* webpackChunkName: 'layoutMarketplace' */ '../components/layouts/Marketplace.vue'),
    meta: {
      title: {
        en: 'Marketplace',
        ru: 'Маркетплейс',
      },
    },
  },
  {
    path: 'marketplace/:country/:state',
    name: 'MarketplaceState',
    component: () => import(/* webpackChunkName: 'layoutMarketplace' */ '../components/layouts/Marketplace.vue'),
    meta: {
      title: {
        en: 'Marketplace',
        ru: 'Маркетплейс',
      },
    },
  },
  {
    path: 'marketplace/:country/:state/:city',
    name: 'MarketplaceCity',
    component: () => import(/* webpackChunkName: 'layoutMarketplace' */ '../components/layouts/Marketplace.vue'),
    meta: {
      title: {
        en: 'Marketplace',
        ru: 'Маркетплейс',
      },
    },
  },
];

export default marketplace;
