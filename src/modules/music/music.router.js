function createArtistRoutes() {
  return [
    {
      path: 'artists/create',
      name: 'artist-create',
      component: () => import(/* webpackChunkName: 'music-artist-create' */ './components/pages/ArtistCreate.vue'),
      meta: {
        title: 'Create Artist',
        requiresAuth: true,
      },
    },
    {
      path: 'artists/:url/edit',
      name: 'artist-edit',
      component: () => import(/* webpackChunkName: 'music-artist-edit' */ './components/pages/ArtistEdit.vue'),
      props: true,
      meta: {
        title: 'Edit Artist',
        requiresAuth: true,
      },
    },
    {
      path: 'artists/:url',
      name: 'artist',
      component: () => import(/* webpackChunkName: 'music-artist' */ './components/pages/Artist.vue'),
      props: true,
      meta: {
        title: 'Artist',
      },
    },
  ];
}

function createAlbumRoutes() {
  return [
    {
      path: 'albums/create',
      name: 'album-create',
      component: () => import(/* webpackChunkName: 'music-album-create' */ './components/pages/AlbumCreate.vue'),
      meta: {
        title: 'Create Album',
        requiresAuth: true,
      },
    },
    {
      path: 'albums/:url/edit',
      name: 'album-edit',
      component: () => import(/* webpackChunkName: 'music-album-edit' */ './components/pages/AlbumEdit.vue'),
      props: true,
      meta: {
        title: 'Edit Album',
        requiresAuth: true,
      },
    },
    {
      path: 'albums/:url',
      name: 'album',
      component: () => import(/* webpackChunkName: 'music-album' */ './components/pages/Album.vue'),
      props: true,
      meta: {
        title: 'Album',
      },
    },
  ];
}

function createTrackRoutes() {
  return [
    {
      path: 'tracks/create',
      name: 'track-create',
      component: () => import(/* webpackChunkName: 'music-track-create' */ './components/pages/TrackCreate.vue'),
      meta: {
        title: 'Create Track',
        requiresAuth: true,
      },
    },
    {
      path: 'tracks/:url/edit',
      name: 'track-edit',
      component: () => import(/* webpackChunkName: 'music-track-edit' */ './components/pages/TrackEdit.vue'),
      props: true,
      meta: {
        title: 'Edit Track',
        requiresAuth: true,
      },
    },
    {
      path: 'tracks/:url',
      name: 'track',
      component: () => import(/* webpackChunkName: 'music-track' */ './components/pages/Track.vue'),
      props: true,
      meta: {
        title: 'Track',
      },
    },
  ];
}

function createPlaylistRoutes() {
  return [
    {
      path: 'playlists/create',
      name: 'playlist-create',
      component: () => import(/* webpackChunkName: 'music-playlist-create' */ './components/pages/PlaylistCreate.vue'),
      meta: {
        title: 'Create Playlist',
        requiresAuth: true,
      },
    },
    {
      path: 'playlists/:url/edit',
      name: 'playlist-edit',
      component: () => import(/* webpackChunkName: 'music-playlist-edit' */ './components/pages/PlaylistEdit.vue'),
      props: true,
      meta: {
        title: 'Edit Playlist',
        requiresAuth: true,
      },
    },
    {
      path: 'playlists/:url',
      name: 'playlist',
      component: () => import(/* webpackChunkName: 'music-playlist' */ './components/pages/Playlist.vue'),
      props: true,
      meta: {
        title: 'Playlist',
      },
    },
  ];
}

function buildMusicRoutes() {
  return [
    {
      path: '',
      name: 'music-home',
      component: () => import(/* webpackChunkName: 'music-home' */ './components/pages/MusicHome.vue'),
      meta: {
        title: 'Music Home',
      },
    },
    {
      path: 'search',
      name: 'music-search',
      component: () => import(/* webpackChunkName: 'music-search' */ './components/pages/SearchResults.vue'),
      meta: {
        title: 'Search Music',
      },
    },
    {
      path: 'library',
      name: 'music-library',
      component: () => import(/* webpackChunkName: 'music-library' */ './components/pages/MusicLibrary.vue'),
      meta: {
        title: 'My Library',
        requiresAuth: true,
      },
    },
    ...createArtistRoutes(),
    ...createAlbumRoutes(),
    ...createTrackRoutes(),
    ...createPlaylistRoutes(),
  ];
}

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routes = [];

  routes.push({
    parentName: route,
    config: {
      basePath: options.basePath || 'music',
      meta: {
        player: options.playerComponent || (() => import(/* webpackChunkName: 'music-bottom-player' */ './components/layouts/MusicBottomPlayer.vue')),
      },
      routes: buildMusicRoutes(options),
    },
  });

  return routes;
}

export default { getRoutes };
