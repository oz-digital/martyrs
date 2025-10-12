// @martyrs/src/modules/music/routes/tracks.routes.js
import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import tracksVerifierFactory from '../middlewares/tracks.verifier.js';

const { getInstance } = ABAC;

export default function setupTracksRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = tracksVerifierFactory(db);

  // Основной CRUD для tracks
  const tracksCRUD = new CRUD({
    app,
    db,
    model: db.track,
    modelName: 'track',
    basePath: '/api/tracks',
    
    auth: { read: false },
    
    verifiers: {
      create: verifier.createVerifier,
      read: verifier.readVerifier,
      update: verifier.updateVerifier,
      delete: verifier.deleteVerifier
    },
    
    abac: abac,
    
    policies: {
      read: { enabled: false }
    },
    
    cache: {
      enabled: true,
      ttl: 300,
      tags: ['tracks', 'music']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Отключаем ABAC для кастомных действий
  tracksCRUD.policies.disableForAction('get-by-url');
  tracksCRUD.policies.disableForAction('recent');
  tracksCRUD.policies.disableForAction('popular');
  tracksCRUD.policies.disableForAction('by-genre');

  // Перенос кастомных роутов через addAction для обратной совместимости

  // Get track by URL - /api/tracks/url/:url
  tracksCRUD.addAction('get-by-url', {
    method: 'get',
    path: '/url/:url',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const track = await db.track
          .findOne({ url: req.params.url })
          .populate('artist', 'name url photoUrl isVerified')
          .populate('album', 'title url coverArt')
          .populate('genre', 'name url');
        
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
    }
  });

  // Get recent tracks - /api/tracks/recent
  tracksCRUD.addAction('recent', {
    method: 'get',
    path: '/recent',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const recentTracks = await db.track
          .find({
            status: 'published',
            isPublic: true,
          })
          .populate('artist', 'name url photoUrl isVerified')
          .populate('album', 'title url coverArt')
          .sort({ createdAt: -1 })
          .limit(limit);
        res.json(recentTracks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get popular tracks - /api/tracks/popular
  tracksCRUD.addAction('popular', {
    method: 'get',
    path: '/popular',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const popularTracks = await db.track
          .find({
            status: 'published',
            isPublic: true,
          })
          .populate('artist', 'name url photoUrl isVerified')
          .populate('album', 'title url coverArt')
          .sort({ playCount: -1 })
          .limit(limit);
        res.json(popularTracks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get tracks by genre - /api/tracks/genre/:genreId
  tracksCRUD.addAction('by-genre', {
    method: 'get',
    path: '/genre/:genreId',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const tracks = await db.track
          .find({
            genre: req.params.genreId,
            status: 'published',
            isPublic: true,
          })
          .populate('artist', 'name url photoUrl isVerified')
          .populate('album', 'title url coverArt')
          .sort({ releaseDate: -1 });
        res.json(tracks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return tracksCRUD;
}