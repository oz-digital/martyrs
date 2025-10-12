// @martyrs/src/modules/music/routes/artists.routes.js
import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import artistsVerifierFactory from '../middlewares/artists.verifier.js';

const { getInstance } = ABAC;

export default function setupArtistsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = artistsVerifierFactory(db);

  // Основной CRUD для artists
  const artistsCRUD = new CRUD({
    app,
    db,
    model: db.artist,
    modelName: 'artist',
    basePath: '/api/artists',
    
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
      tags: ['artists', 'music']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Перенос кастомных роутов через addAction для обратной совместимости

  // Get artist by URL - /api/artists/url/:url
  artistsCRUD.addAction('get-by-url', {
    method: 'get',
    path: '/url/:url',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const artist = await db.artist.findOne({ url: req.params.url });
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        res.json(artist);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get artist discography - /api/artists/:artistId/discography
  artistsCRUD.addAction('discography', {
    method: 'get',
    path: '/:artistId/discography',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const { artistId } = req.params;
        
        // Получаем альбомы артиста
        const albums = await db.album
          .find({ artists: artistId })
          .populate('artists', 'name')
          .sort({ releaseDate: -1 });
        
        // Получаем популярные треки артиста (включая те, которые не в альбомах)
        const tracks = await db.track
          .find({ 
            artist: artistId,
            status: 'published',
            isPublic: true 
          })
          .populate('album', 'title url coverArt')
          .populate('genre', 'name')
          .sort({ playCount: -1 })
          .limit(10);
        
        res.json({
          albums,
          tracks,
          singles: tracks.filter(track => !track.album), // треки без альбома считаем синглами
          artist: artistId
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Verify artist (admin only) - /api/artists/:artistId/verify
  artistsCRUD.addAction('verify-artist', {
    method: 'put',
    path: '/:artistId/verify',
    auth: true,
    abac: {
      resource: 'artists',
      action: 'verify',
      strict: true
    },
    handler: async (req, res) => {
      try {
        const { artistId } = req.params;
        
        const artist = await db.artist.findByIdAndUpdate(
          artistId,
          { isVerified: true },
          { new: true }
        );
        
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json({ 
          message: 'Artist verified successfully',
          artist
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get related artists - /api/artists/:artistId/related
  artistsCRUD.addAction('related-artists', {
    method: 'get',
    path: '/:artistId/related',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const { artistId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        
        // Получаем артиста для поиска по жанрам
        const artist = await db.artist.findById(artistId);
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        
        // Ищем похожих артистов по жанрам
        const relatedArtists = await db.artist
          .find({
            _id: { $ne: artistId }, // исключаем самого артиста
            genre: { $in: artist.genre }, // общие жанры
            status: 'published'
          })
          .limit(limit)
          .sort({ popularity: -1 });
        
        res.json(relatedArtists);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return artistsCRUD;
}