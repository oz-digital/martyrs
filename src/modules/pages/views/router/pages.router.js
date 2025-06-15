import layoutEmpty from '@martyrs/src/modules/globals/views/components/layouts/Empty.vue';

const pages = {
  path: 'pages',
  component: layoutEmpty,
  meta: {
    title: {
      en: 'Pages',
      ru: 'Информация',
    },
  },
  children: [
    {
      path: ':url+',
      name: 'Page',
      meta: {
        title: {
          en: 'Page',
          ru: 'Страница',
        },
      },
      component: () => import(/* webpackChunkName: 'Page' */ '../components/pages/Page.vue'),
    },
  ],
};

export default pages;
