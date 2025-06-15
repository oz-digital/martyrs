// router/music.js
export default {
  path: 'music',
  component: () => import('../components/layouts/MusicLayout.vue'),
  children: [
    {
      path: '',
      name: 'music-home',
      component: () => import('../components/pages/MusicHome.vue'),
      meta: {
        title: 'Music Home',
      },
    },
    {
      path: 'search',
      name: 'music-search',
      component: () => import('../components/pages/SearchResults.vue'),
      meta: {
        title: 'Search Music',
      },
    },
    {
      path: 'library',
      name: 'music-library',
      component: () => import('../components/pages/MusicLibrary.vue'),
      meta: {
        title: 'My Library',
        requiresAuth: true,
      },
    },
    {
      path: 'upload',
      name: 'music-upload',
      component: () => import('../components/pages/MusicUpload.vue'),
      meta: {
        title: 'Upload Music',
        requiresAuth: true,
      },
    },
    {
      path: 'artists/:url',
      name: 'artist-detail',
      component: () => import('../components/pages/ArtistDetail.vue'),
      props: true,
      meta: {
        title: 'Artist Details',
      },
    },
    {
      path: 'artists/create',
      name: 'artist-create',
      component: () => import('../components/pages/ArtistForm.vue'),
      meta: {
        title: 'Create Artist',
        requiresAuth: true,
      },
    },
    {
      path: 'artists/:id/edit',
      name: 'artist-edit',
      component: () => import('../components/pages/ArtistForm.vue'),
      props: route => ({ isEditMode: true, artistId: route.params.id }),
      meta: {
        title: 'Edit Artist',
        requiresAuth: true,
      },
    },
    {
      path: 'albums/:url',
      name: 'album-detail',
      component: () => import('../components/pages/AlbumDetail.vue'),
      props: true,
      meta: {
        title: 'Album Details',
      },
    },
    {
      path: 'playlists/:url',
      name: 'playlist-detail',
      component: () => import('../components/pages/PlaylistDetail.vue'),
      props: true,
      meta: {
        title: 'Playlist Details',
      },
    },
    {
      path: 'tracks/:url',
      name: 'track-detail',
      component: () => import('../components/pages/TrackDetail.vue'),
      props: true,
      meta: {
        title: 'Track Details',
      },
    },
  ],
};
