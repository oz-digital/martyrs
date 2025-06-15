import music from './music.controller.js';
export default (function (app, db) {
  const { MusicController } = music(app, db);
  class PlaylistController extends MusicController {
    constructor(app, db) {
      super('/api/playlists', app, db, db.playlist);
    }
    // Add track to playlist
    async addTrack(req, res) {
      try {
        const { playlistId, trackId } = req.params;
        // Find the playlist
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: 'playlists',
          action: 'update',
          currentResource: playlist,
        });
        if (!accessResult.allowed) {
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        // Check if track exists
        const track = await db.track.findById(trackId);
        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }
        // Check if track is already in playlist
        const trackExists = playlist.tracks.some(item => item.track.toString() === trackId);
        if (trackExists) {
          return res.status(400).json({ error: 'Track already in playlist' });
        }
        // Add track to playlist
        playlist.tracks.push({
          track: trackId,
          addedAt: new Date(),
        });
        await playlist.save();
        await this.cache.flush();
        res.json(playlist);
      } catch (error) {
        this.logger.error(`Error adding track to playlist: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Remove track from playlist
    async removeTrack(req, res) {
      try {
        const { playlistId, trackId } = req.params;
        // Find the playlist
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: 'playlists',
          action: 'update',
          currentResource: playlist,
        });
        if (!accessResult.allowed) {
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        // Remove track from playlist
        playlist.tracks = playlist.tracks.filter(item => item.track.toString() !== trackId);
        await playlist.save();
        await this.cache.flush();
        res.json(playlist);
      } catch (error) {
        this.logger.error(`Error removing track from playlist: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Get user playlists
    async getUserPlaylists(req, res) {
      try {
        const userId = req.params.userId || req.userId;
        // Get playlists where user is owner or collaborator
        const playlists = await db.playlist
          .find({
            $or: [{ 'owner.target': userId, 'owner.type': 'User' }, { collaborators: userId }],
          })
          .sort({ updatedAt: -1 });
        res.json(playlists);
      } catch (error) {
        this.logger.error(`Error getting user playlists: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Add collaborator to playlist
    async addCollaborator(req, res) {
      try {
        const { playlistId, userId } = req.params;
        // Find the playlist
        const playlist = await db.playlist.findById(playlistId);
        if (!playlist) {
          return res.status(404).json({ error: 'Playlist not found' });
        }
        // Only owner can add collaborators
        if (playlist.owner.target.toString() !== req.userId) {
          return res.status(403).json({ error: 'Only playlist owner can add collaborators' });
        }
        // Check if user exists
        const user = await db.mongoose.model('User').findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        // Check if user is already a collaborator
        if (playlist.collaborators.includes(userId)) {
          return res.status(400).json({ error: 'User is already a collaborator' });
        }
        // Add collaborator
        playlist.collaborators.push(userId);
        playlist.isCollaborative = true;
        await playlist.save();
        await this.cache.flush();
        res.json(playlist);
      } catch (error) {
        this.logger.error(`Error adding collaborator to playlist: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  }
  const playlistController = new PlaylistController(app, db);
  return {
    create: playlistController.create.bind(playlistController),
    read: playlistController.read.bind(playlistController),
    update: playlistController.update.bind(playlistController),
    delete: playlistController.delete.bind(playlistController),
    addTrack: playlistController.addTrack.bind(playlistController),
    removeTrack: playlistController.removeTrack.bind(playlistController),
    getUserPlaylists: playlistController.getUserPlaylists.bind(playlistController),
    addCollaborator: playlistController.addCollaborator.bind(playlistController),
  };
});
