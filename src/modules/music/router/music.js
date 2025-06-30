// router/music.js
import artistRoutes from './artists.js';
import albumRoutes from './albums.js';
import trackRoutes from './tracks.js';
import playlistRoutes from './playlists.js';

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
    // Artists routes
    ...artistRoutes,
    // Albums routes
    ...albumRoutes,
    // Tracks routes
    ...trackRoutes,
    // Playlists routes
    ...playlistRoutes,
  ],
};