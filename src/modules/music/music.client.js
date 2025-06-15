// Store modules
import * as storeAlbums from './store/albums.js';
import * as storeArtists from './store/artists.js';
import * as storePlayer from './store/player.js';
import * as storePlaylists from './store/playlists.js';
import * as storeSearch from './store/search.js';
import * as storeTracks from './store/tracks.js';

// Router
import routerMusic from './router/music.js';

// Layouts
import MusicLayout from './components/layouts/MusicLayout.vue';

// Pages
import AlbumDetail from './components/pages/AlbumDetail.vue';
import ArtistDetail from './components/pages/ArtistDetail.vue';
import MusicHome from './components/pages/MusicHome.vue';
import MusicLibrary from './components/pages/MusicLibrary.vue';
import MusicUpload from './components/pages/MusicUpload.vue';
import PlaylistDetail from './components/pages/PlaylistDetail.vue';
import SearchResults from './components/pages/SearchResults.vue';
import TrackDetail from './components/pages/TrackDetail.vue';

// Components - Player
import MusicPlayer from './components/player/MusicPlayer.vue';
import TrackProgress from './components/player/TrackProgress.vue';
import VolumeControl from './components/player/VolumeControl.vue';

// Components - Cards
import AlbumCard from './components/cards/AlbumCard.vue';
import ArtistCard from './components/cards/ArtistCard.vue';
import PlaylistCard from './components/cards/PlaylistCard.vue';
import TrackCard from './components/cards/TrackCard.vue';

// Components - Lists
import AlbumList from './components/lists/AlbumList.vue';
import ArtistList from './components/lists/ArtistList.vue';
import PlaylistList from './components/lists/PlaylistList.vue';
import TrackList from './components/lists/TrackList.vue';

// Components - Forms
import PlaylistForm from './components/forms/PlaylistForm.vue';
import SearchForm from './components/forms/SearchForm.vue';
import UploadForm from './components/forms/UploadForm.vue';

// WebSocket integration for streaming
import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';

/**
 * Initialize Music module on client-side
 * @param {Object} app - Vue app instance
 * @param {Object} store - Global store instance
 * @param {Object} router - Vue router instance
 * @param {Object} config - Configuration options
 * @param {Object} options - Additional options
 */
function initializeMusic(app, store, router, config, options = {}) {
  const route = options.route || 'Home';

  // Register routes
  router.addRoute(route, routerMusic);

  // Register store modules
  store.addStore('tracks', storeTracks);
  store.addStore('playlists', storePlaylists);
  store.addStore('albums', storeAlbums);
  store.addStore('artists', storeArtists);
  store.addStore('player', storePlayer);
  store.addStore('search', storeSearch);

  // Set up WebSocket subscription for music streaming
  if (options.enableStreaming !== false && app.config.globalProperties.WSS_URL) {
    globalWebSocket.initialize({
      wsUrl: app.config.globalProperties.WSS_URL,
      maxReconnectAttempts: 10,
      reconnectDelay: 2000,
    });

    // Subscribe to music streaming module when authenticated
    if (options.userId) {
      globalWebSocket
        .connect(options.userId)
        .then(() => {
          globalWebSocket.subscribeModule('music-streaming');
        })
        .catch(err => {
          console.error('Failed to connect to WebSocket for music streaming:', err);
        });
    }
  }

  // Register global components if needed
  app.component('MusicPlayer', MusicPlayer);
}

// Module export
const ModuleMusic = {
  initialize: initializeMusic,
  views: {
    store: {
      storeTracks,
      storePlaylists,
      storeAlbums,
      storeArtists,
      storePlayer,
      storeSearch,
    },
    router: {
      routerMusic,
    },
    components: {
      // Layouts
      MusicLayout,
      // Pages
      MusicHome,
      SearchResults,
      ArtistDetail,
      AlbumDetail,
      PlaylistDetail,
      TrackDetail,
      MusicLibrary,
      MusicUpload,
      // Player Components
      MusicPlayer,
      TrackProgress,
      VolumeControl,
      // Cards
      TrackCard,
      AlbumCard,
      PlaylistCard,
      ArtistCard,
      // Lists
      TrackList,
      AlbumList,
      PlaylistList,
      ArtistList,
      // Forms
      PlaylistForm,
      SearchForm,
      UploadForm,
    },
  },
};

// Named exports for direct component imports
export {
  AlbumCard,
  AlbumDetail,
  AlbumList,
  ArtistCard,
  ArtistDetail,
  ArtistList,
  // Pages
  MusicHome,
  // Layout
  MusicLayout,
  MusicLibrary,
  // Player Components
  MusicPlayer,
  MusicUpload,
  PlaylistCard,
  PlaylistDetail,
  // Forms
  PlaylistForm,
  PlaylistList,
  SearchForm,
  SearchResults,
  // Cards
  TrackCard,
  TrackDetail,
  // Lists
  TrackList,
  TrackProgress,
  UploadForm,
  VolumeControl,
  // Router
  routerMusic,
  storeAlbums,
  storeArtists,
  storePlayer,
  storePlaylists,
  storeSearch,
  // Store modules
  storeTracks,
};

// Default export
export default ModuleMusic;
