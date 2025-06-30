// router/artists.js
export default [
  {
    path: 'artists/create',
    name: 'artist-create',
    component: () => import('../components/pages/ArtistCreate.vue'),
    meta: {
      title: 'Create Artist',
      requiresAuth: true,
    },
  },
  {
    path: 'artists/:url/edit',
    name: 'artist-edit',
    component: () => import('../components/pages/ArtistEdit.vue'),
    props: true,
    meta: {
      title: 'Edit Artist',
      requiresAuth: true,
    },
  },
  {
    path: 'artists/:url',
    name: 'artist',
    component: () => import('../components/pages/Artist.vue'),
    props: true,
    meta: {
      title: 'Artist',
    },
  },
];