// @martyrs/src/modules/music/routes/albums.routes.js
import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';
import albumsVerifierFactory from '../middlewares/albums.verifier.js';

const { getInstance } = ABAC;

export default function setupAlbumsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = albumsVerifierFactory(db);

  // Основной CRUD для albums
  const albumsCRUD = new CRUD({
    app,
    db,
    model: db.album,
    modelName: 'album',
    basePath: '/api/albums',
    
    auth: true,
    
    verifiers: {
      create: verifier.createVerifier,
      read: verifier.readVerifier,
      update: verifier.updateVerifier,
      delete: verifier.deleteVerifier
    },
    
    abac: abac,
    
    cache: {
      enabled: true,
      ttl: 300,
      tags: ['albums', 'music']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Перенос кастомных роутов через addAction для обратной совместимости

  // Get album by URL - /api/albums/url/:url
  albumsCRUD.addAction('get-by-url', {
    method: 'get',
    path: '/url/:url',
    auth: false,
    handler: async (req, res) => {
      try {
        const album = await db.album
          .findOne({ url: req.params.url })
          .populate('artists', 'name url');
        
        if (!album) {
          return res.status(404).json({ error: 'Album not found' });
        }
        
        res.json(album);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get album tracks - /api/albums/:albumId/tracks
  albumsCRUD.addAction('album-tracks', {
    method: 'get',
    path: '/:albumId/tracks',
    auth: false,
    handler: async (req, res) => {
      try {
        const { albumId } = req.params;
        
        const tracks = await db.track
          .find({ 
            album: albumId,
            status: 'published',
            isPublic: true
          })
          .populate('artist', 'name url')
          .populate('genre', 'name')
          .sort({ trackNumber: 1, createdAt: 1 });
        
        res.json(tracks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get featured albums - /api/albums/featured
  albumsCRUD.addAction('featured', {
    method: 'get',
    path: '/featured',
    auth: false,
    handler: async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Получаем рекомендуемые альбомы (можно добавить поле featured в модель)
        // Пока используем популярные недавние альбомы
        const featuredAlbums = await db.album
          .find({ 
            status: 'published',
            releaseDate: { 
              $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // последние 90 дней
            }
          })
          .populate('artists', 'name url')
          .sort({ createdAt: -1 })
          .limit(limit);
        
        res.json(featuredAlbums);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return albumsCRUD;
}