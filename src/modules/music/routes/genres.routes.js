// @martyrs/src/modules/music/routes/genres.routes.js
import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import genresVerifierFactory from '../middlewares/genres.verifier.js';

const { getInstance } = ABAC;

export default function setupGenresRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = genresVerifierFactory(db);

  // Основной CRUD для genres
  const genresCRUD = new CRUD({
    app,
    db,
    model: db.genre,
    modelName: 'genre',
    basePath: '/api/genres',
    
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
      tags: ['genres', 'music']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Перенос кастомных роутов через addAction для обратной совместимости

  // Get genre by URL - /api/genres/url/:url
  genresCRUD.addAction('get-by-url', {
    method: 'get',
    path: '/url/:url',
    auth: false,
    handler: async (req, res) => {
      try {
        const genre = await db.genre.findOne({ url: req.params.url });
        if (!genre) {
          return res.status(404).json({ error: 'Genre not found' });
        }
        res.json(genre);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get tracks by genre - /api/genres/:genreId/tracks
  genresCRUD.addAction('genre-tracks', {
    method: 'get',
    path: '/:genreId/tracks',
    auth: false,
    handler: async (req, res) => {
      try {
        const { genreId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        
        const tracks = await db.track
          .find({
            genre: genreId,
            status: 'published',
            isPublic: true
          })
          .populate('artist', 'name url')
          .populate('album', 'title url')
          .sort({ playCount: -1, releaseDate: -1 })
          .skip(skip)
          .limit(limit);
        
        res.json(tracks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get popular genres - /api/genres/popular
  genresCRUD.addAction('popular', {
    method: 'get',
    path: '/popular',
    auth: false,
    handler: async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 20;
        
        const popularGenres = await db.genre
          .find({ status: 'published' })
          .sort({ popularity: -1 })
          .limit(limit);
        
        res.json(popularGenres);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return genresCRUD;
}