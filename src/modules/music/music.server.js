import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import globalswebsocket from '@martyrs/src/modules/globals/controllers/classes/globals.websocket.js';

// NEW CRUD Routes
import setupTracksRoutes from './routes/tracks.routes.js';
import setupArtistsRoutes from './routes/artists.routes.js';
import setupAlbumsRoutes from './routes/albums.routes.js';
import setupPlaylistsRoutes from './routes/playlists.routes.js';
import setupGenresRoutes from './routes/genres.routes.js';

// Keep only necessary controllers (search, stream)
import SearchController from './controllers/search.controller.js';
import StreamController from './controllers/stream.controller.js';

// Models
import AlbumModel from './models/album.model.js';
import ArtistModel from './models/artist.model.js';
import GenreModel from './models/genre.model.js';
import PlayHistoryModel from './models/play-history.model.js';
import PlaylistModel from './models/playlist.model.js';
import TrackModel from './models/track.model.js';

// Policies
import musicPolicies from './policies/music.policies.js';

// Keep legacy routes for now (search, stream)
import searchRoutes from './routes/search.routes.js';
import streamRoutes from './routes/stream.routes.js';

import StreamingHandler from './websocket/streaming.handler.js';
/**
 * Initialize the Music module
 * @param {Object} app - Express application instance
 * @param {Object} db - Database connection object
 * @param {Array} origins - CORS allowed origins
 * @param {String} publicPath - Path to public files
 */
function initializeMusic({ app, db, wss, origins, publicPath }) {
  // Register models in the database object
  db.track = TrackModel(db);
  db.playlist = PlaylistModel(db);
  db.album = AlbumModel(db);
  db.artist = ArtistModel(db);
  db.genre = GenreModel(db);
  db.playHistory = PlayHistoryModel(db);
  console.log('server publioc is', publicPath);
  // Set up NEW CRUD routes if app is provided
  if (app) {
    // Initialize new CRUD routes
    setupTracksRoutes(app, db);
    setupArtistsRoutes(app, db);
    setupAlbumsRoutes(app, db);
    setupPlaylistsRoutes(app, db);
    setupGenresRoutes(app, db);
    
    // Keep legacy routes that don't have CRUD equivalents
    streamRoutes(app, db, origins, publicPath);
    searchRoutes(app, db, origins, publicPath);
  }
  // Initialize ABAC policies for music module
  const { getInstance } = globalsabac;
  const abac = getInstance(db);
  musicPolicies(abac);
  // Set up WebSocket handlers if wss is provided
  if (wss) {
    console.log('Music Server: Registering music-streaming WebSocket handler');
    const handler = StreamingHandler(db);
    wss.registerModule('music-streaming', handler.handleStreamingMessage);
    console.log('Music Server: WebSocket handler registered successfully');
  } else {
    console.log('Music Server: WebSocket server (wss) not provided, streaming handler not registered');
  }
  const musicCache = new Cache({ ttlSeconds: 60 * 15 }); // 15 minute cache
  const musicLogger = new Logger(db);
  // Log module initialization
  musicLogger.info('Music module initialized');
}
export const models = {
  TrackModel,
  PlaylistModel,
  AlbumModel,
  ArtistModel,
  GenreModel,
  PlayHistoryModel,
};
export const routes = {
  // NEW CRUD Routes
  setupTracksRoutes,
  setupArtistsRoutes,
  setupAlbumsRoutes,
  setupPlaylistsRoutes,
  setupGenresRoutes,
  // Legacy routes
  streamRoutes,
  searchRoutes,
};
export const controllers = {
  // Keep only non-CRUD controllers
  StreamController,
  SearchController,
};
export { initializeMusic as initialize };
export default {
  initialize: initializeMusic,
  models,
  routes,
  controllers,
};
