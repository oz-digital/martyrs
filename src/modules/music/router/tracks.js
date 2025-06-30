// router/tracks.js
export default [
  {
    path: 'tracks/create',
    name: 'track-create',
    component: () => import('../components/pages/TrackCreate.vue'),
    meta: {
      title: 'Create Track',
      requiresAuth: true,
    },
  },
  {
    path: 'tracks/:url/edit',
    name: 'track-edit',
    component: () => import('../components/pages/TrackEdit.vue'),
    props: true,
    meta: {
      title: 'Edit Track',
      requiresAuth: true,
    },
  },
  {
    path: 'tracks/:url',
    name: 'track',
    component: () => import('../components/pages/Track.vue'),
    props: true,
    meta: {
      title: 'Track',
    },
  },
];