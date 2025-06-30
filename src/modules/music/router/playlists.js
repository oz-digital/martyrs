// router/playlists.js
export default [
  {
    path: 'playlists/create',
    name: 'playlist-create',
    component: () => import('../components/pages/PlaylistCreate.vue'),
    meta: {
      title: 'Create Playlist',
      requiresAuth: true,
    },
  },
  {
    path: 'playlists/:url/edit',
    name: 'playlist-edit',
    component: () => import('../components/pages/PlaylistEdit.vue'),
    props: true,
    meta: {
      title: 'Edit Playlist',
      requiresAuth: true,
    },
  },
  {
    path: 'playlists/:url',
    name: 'playlist',
    component: () => import('../components/pages/Playlist.vue'),
    props: true,
    meta: {
      title: 'Playlist',
    },
  },
];