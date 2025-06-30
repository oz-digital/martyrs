// router/albums.js
export default [
  {
    path: 'albums/create',
    name: 'album-create',
    component: () => import('../components/pages/AlbumCreate.vue'),
    meta: {
      title: 'Create Album',
      requiresAuth: true,
    },
  },
  {
    path: 'albums/:url/edit',
    name: 'album-edit',
    component: () => import('../components/pages/AlbumEdit.vue'),
    props: true,
    meta: {
      title: 'Edit Album',
      requiresAuth: true,
    },
  },
  {
    path: 'albums/:url',
    name: 'album',
    component: () => import('../components/pages/Album.vue'),
    props: true,
    meta: {
      title: 'Album',
    },
  },
];