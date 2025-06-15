const gallery = {
  name: 'Gallery',
  path: 'gallery',
  meta: {
    title_hide: true,
  },
  component: () => import(/* webpackChunkName: 'Gallery' */ '@martyrs/src/modules/gallery/components/pages/Gallery.vue'),
};

export default gallery;
