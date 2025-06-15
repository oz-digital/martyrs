import layoutConfigurator from '../components/layouts/layoutConfigurator.vue';

const configurator = [
  {
    path: 'configurator',
    name: 'Configurator',
    component: layoutConfigurator,
    children: [
      {
        path: '',
        name: 'Styles',
        component: () => import(/* webpackChunkName: "signin" */ '../components/pages/Styles.vue'),
      },
    ],
  },
];

export default configurator;
