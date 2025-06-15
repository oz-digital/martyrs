import Sidebar from '@martyrs/src/modules/backoffice/components/partials/Sidebar.vue';

import SidebarPages from '../components/partials/SidebarPages.vue';

const pages = {
  path: 'pages',
  meta: {
    title: {
      en: 'Pages',
    },
    sidebar: Sidebar,
  },
  children: [
    {
      path: '',
      name: 'Backoffice Pages',
      component: () => import(/* webpackChunkName: 'Pages' */ '../components/pages/Pages.vue'),
    },
    {
      path: 'add',
      name: 'Backoffice Pages Add',
      meta: {
        title: {
          en: 'New Page',
        },
        sidebar: SidebarPages,
      },
      component: () => import(/* webpackChunkName: 'Pages' */ '../components/pages/PageEdit.vue'),
    },
    {
      path: ':url+',
      name: 'Backoffice Pages Edit',
      meta: {
        title: {
          en: 'Edit Page',
        },
        sidebar: SidebarPages,
      },
      component: () => import(/* webpackChunkName: 'Pages' */ '../components/pages/PageEdit.vue'),
    },
  ],
};

export default pages;
