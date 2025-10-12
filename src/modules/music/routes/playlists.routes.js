// @martyrs/src/modules/music/routes/playlists.routes.js
import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import playlistsVerifierFactory from '../middlewares/playlists.verifier.js';

const { getInstance } = ABAC;

export default function setupPlaylistsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = playlistsVerifierFactory(db);

  // Основной CRUD для playlists
  const playlistsCRUD = new CRUD({
    app,
    db,
    model: db.playlist,
    modelName: 'playlist',
    basePath: '/api/playlists',
    
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
      tags: ['playlists', 'music']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  // Перенос кастомных роутов через addAction для обратной совместимости

  // Get playlist by URL - /api/playlists/url/:url
  playlistsCRUD.addAction('get-by-url', {
    method: 'get',
    path: '/url/:url',
    auth: false,
    abac: { enabled: false },
    handler: async (req, res) => {
      try {
        const playlist = await db.playlist
          .findOne({ url: req.params.url })
          .populate({
            path: 'tracks.track',
            select: '-lyrics',
            populate: [
              {
                path: 'artist',
                select: 'name url photoUrl isVerified'
              },
              {
                path: 'album', 
                select: 'title url coverArt'
              },
              {
                path: 'genre',
                select: 'name url'
              }
            ]
          });
        
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        
        // Only return public playlists if no auth
        if (!playlist.isPublic && !req.userId) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        
        // If private and authenticated, check permissions
        if (!playlist.isPublic && req.userId) {
          const isOwner = playlist.owner.target.toString() === req.userId;
          const isCollaborator = playlist.collaborators.some(collab => collab.toString() === req.userId);
          
          if (!isOwner && !isCollaborator) {
            return res.status(404).json({ error: 'Playlist not found' });
          }
        }
        
        res.json(playlist);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Get user playlists - /api/playlists/user/:userId?
  playlistsCRUD.addAction('user-playlists', {
    method: 'get',
    path: '/user/:userId?',
    auth: true,
    handler: async (req, res) => {
      try {
        const userId = req.params.userId || req.userId;
        
        // Если запрашивают чужие плейлисты, показываем только публичные
        const query = { 'owner.target': userId };
        if (userId !== req.userId) {
          query.isPublic = true;
        }
        
        const playlists = await db.playlist
          .find(query)
          .populate({
            path: 'tracks.track',
            select: 'title artist album genre duration',
            populate: [
              {
                path: 'artist',
                select: 'name url photoUrl isVerified'
              },
              {
                path: 'album', 
                select: 'title url coverArt'
              }
            ]
          })
          .sort({ updatedAt: -1 });
        
        res.json(playlists);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Add track to playlist - /api/playlists/:playlistId/tracks/:trackId
  playlistsCRUD.addAction('add-track', {
    method: 'post',
    path: '/:playlistId/tracks/:trackId',
    auth: true,
    abac: {
      resource: 'playlists',
      action: 'update'
    },
    handler: async (req, res) => {
      try {
        const { playlistId, trackId } = req.params;
        
        // Проверяем существование трека
        const track = await db.track.findById(trackId);
        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }
        
        // Проверяем, есть ли уже этот трек в плейлисте
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        
        const trackExists = playlist.tracks.some(t => t.track.toString() === trackId);
        if (trackExists) {
          return res.status(400).json({ error: 'Track already in playlist' });
        }
        
        // Добавляем трек
        playlist.tracks.push({
          track: trackId,
          addedAt: new Date()
        });
        
        await playlist.save();
        
        res.json({ 
          message: 'Track added to playlist successfully',
          playlist
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Remove track from playlist - /api/playlists/:playlistId/tracks/:trackId
  playlistsCRUD.addAction('remove-track', {
    method: 'delete',
    path: '/:playlistId/tracks/:trackId',
    auth: true,
    abac: {
      resource: 'playlists',
      action: 'update'
    },
    handler: async (req, res) => {
      try {
        const { playlistId, trackId } = req.params;
        
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        
        // Удаляем трек из плейлиста
        playlist.tracks = playlist.tracks.filter(
          t => t.track.toString() !== trackId
        );
        
        await playlist.save();
        
        res.json({ 
          message: 'Track removed from playlist successfully',
          playlist
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Add collaborator to playlist - /api/playlists/:playlistId/collaborators/:userId
  playlistsCRUD.addAction('add-collaborator', {
    method: 'post',
    path: '/:playlistId/collaborators/:userId',
    auth: true,
    abac: {
      resource: 'playlists',
      action: 'update'
    },
    handler: async (req, res) => {
      try {
        const { playlistId, userId } = req.params;
        
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        
        // Проверяем, не является ли пользователь уже коллабором
        if (playlist.collaborators.includes(userId)) {
          return res.status(400).json({ error: 'User is already a collaborator' });
        }
        
        // Добавляем коллаборатора
        playlist.collaborators.push(userId);
        playlist.isCollaborative = true;
        
        await playlist.save();
        
        res.json({ 
          message: 'Collaborator added successfully',
          playlist
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  return playlistsCRUD;
}