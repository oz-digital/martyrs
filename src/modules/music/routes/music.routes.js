import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../controllers/music.controller.js';
// ABAC
const { getInstance } = globalsabac;
export default (function (app, db, origins, publicPath) {
  const { MusicController } = controllerFactory(app, db);
  const { authJwt } = middlewareFactoryAuth(db);
  const controller = new MusicController('/api/tracks', app, db, db.track, {
    disableDefaultRoutes: true,
  });
  const abac = getInstance(db);
  // CRUD operations for tracks
  app.post(
    '/api/tracks/create',
    [
      authJwt.verifyToken(), // Auth middleware
      (req, res, next) => {
        // Debugging middleware
        console.log('[Route] /api/tracks/create - Request received');
        console.log('[Route] User ID from token:', req.userId);
        next();
      },
    ],
    controller.create.bind(controller) // Bind to ensure 'this' context
  );
  app.get('/api/tracks/read', controller.read.bind(controller));
  app.put('/api/tracks/update', [authJwt.verifyToken], controller.update.bind(controller));
  app.delete('/api/tracks/delete', [authJwt.verifyToken], controller.delete.bind(controller));
  // Get track by URL
  app.get('/api/tracks/url/:url', async (req, res) => {
    try {
      const track = await db.track.findOne({ url: req.params.url });
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      // Check access using ABAC
      const accessResult = await abac.checkAccess({
        user: req.userId,
        resource: 'tracks',
        action: 'read',
        currentResource: track,
      });
      if (!accessResult.allowed && !track.isPublic) {
        return res.status(403).json({
          errorCode: accessResult.reason,
          message: 'Access Denied',
        });
      }
      res.json(track);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  // Get recent tracks
  app.get('/api/tracks/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const recentTracks = await db.track
        .find({
          status: 'published',
          isPublic: true,
        })
        .sort({ createdAt: -1 })
        .limit(limit);
      res.json(recentTracks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  // Get popular tracks
  app.get('/api/tracks/popular', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const popularTracks = await db.track
        .find({
          status: 'published',
          isPublic: true,
        })
        .sort({ playCount: -1 })
        .limit(limit);
      res.json(popularTracks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  // Get tracks by genre
  app.get('/api/tracks/genre/:genreId', async (req, res) => {
    try {
      const tracks = await db.track
        .find({
          genre: req.params.genreId,
          status: 'published',
          isPublic: true,
        })
        .sort({ releaseDate: -1 });
      res.json(tracks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
