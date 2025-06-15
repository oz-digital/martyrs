import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import globalswebsocket from '@martyrs/src/modules/globals/controllers/classes/globals.websocket.js';
import AlbumController from './controllers/album.controller.js';
import ArtistController from './controllers/artist.controller.js';
import GenreController from './controllers/genre.controller.js';
import MusicController from './controllers/music.controller.js';
import PlaylistController from './controllers/playlist.controller.js';
import SearchController from './controllers/search.controller.js';
import StreamController from './controllers/stream.controller.js';
import AlbumModel from './models/album.model.js';
import ArtistModel from './models/artist.model.js';
import GenreModel from './models/genre.model.js';
import PlayHistoryModel from './models/play-history.model.js';
import PlaylistModel from './models/playlist.model.js';
import TrackModel from './models/track.model.js';
import musicPolicies from './policies/music.policies.js';
import albumRoutes from './routes/album.routes.js';
import artistRoutes from './routes/artist.routes.js';
import genreRoutes from './routes/genre.routes.js';
import musicRoutes from './routes/music.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
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
  // Set up routes if app is provided
  if (app) {
    musicRoutes(app, db, origins, publicPath);
    playlistRoutes(app, db, origins, publicPath);
    albumRoutes(app, db, origins, publicPath);
    artistRoutes(app, db, origins, publicPath);
    streamRoutes(app, db, origins, publicPath);
    searchRoutes(app, db, origins, publicPath);
    genreRoutes(app, db, origins, publicPath);
  }
  // Initialize ABAC policies for music module
  const { getInstance } = globalsabac;
  const abac = getInstance(db);
  musicPolicies(abac);
  // Set up WebSocket handlers if WebSocketManager is available
  const { WebSocketManager } = globalswebsocket;
  if (global.webSocketManager && global.webSocketManager instanceof WebSocketManager) {
    global.webSocketManager.registerModule('music-streaming', StreamingHandler(db).handleStreamingMessage);
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
  musicRoutes,
  playlistRoutes,
  albumRoutes,
  artistRoutes,
  streamRoutes,
  searchRoutes,
  genreRoutes,
};
export const controllers = {
  MusicController,
  PlaylistController,
  AlbumController,
  ArtistController,
  StreamController,
  SearchController,
  GenreController,
};
export { initializeMusic as initialize };
export default {
  initialize: initializeMusic,
  models,
  routes,
  controllers,
};
