import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import playlist from '../controllers/playlist.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = playlist(app, db);
  const { authJwt } = middlewareFactoryAuth(db);
  // CRUD operations for playlists
  app.post('/api/playlists/create', [authJwt.verifyToken], controller.create);
  app.get('/api/playlists/read', controller.read);
  app.put('/api/playlists/update', [authJwt.verifyToken], controller.update);
  app.delete('/api/playlists/delete', [authJwt.verifyToken], controller.delete);
  // Get user playlists
  app.get('/api/playlists/user/:userId?', [authJwt.verifyToken], controller.getUserPlaylists);
  // Add track to playlist
  app.post('/api/playlists/:playlistId/tracks/:trackId', [authJwt.verifyToken], controller.addTrack);
  // Remove track from playlist
  app.delete('/api/playlists/:playlistId/tracks/:trackId', [authJwt.verifyToken], controller.removeTrack);
  // Add collaborator to playlist
  app.post('/api/playlists/:playlistId/collaborators/:userId', [authJwt.verifyToken], controller.addCollaborator);
  // Get playlist by URL
  app.get('/api/playlists/url/:url', async (req, res) => {
    try {
      const playlist = await db.playlist.findOne({ url: req.params.url }).populate({
        path: 'tracks.track',
        select: '-lyrics',
      });
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      // If not public, check permissions
      if (!playlist.isPublic) {
        // Only owner and collaborators can see private playlists
        if (!req.userId) {
          return res.status(403).json({ error: 'Access denied to private playlist' });
        }
        const isOwner = playlist.owner.target.toString() === req.userId;
        const isCollaborator = playlist.collaborators.some(collab => collab.toString() === req.userId);
        if (!isOwner && !isCollaborator) {
          return res.status(403).json({ error: 'Access denied to private playlist' });
        }
      }
      res.json(playlist);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
