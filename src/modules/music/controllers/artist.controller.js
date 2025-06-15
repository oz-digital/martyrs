import music from './music.controller.js';
export default (function (app, db) {
  const { MusicController } = music(app, db);
  class ArtistController extends MusicController {
    constructor(app) {
      super('/api/artists', app, db, db.artist);
    }
    // Get artist discography
    async getDiscography(req, res) {
      try {
        const artistId = req.params.artistId;
        // Verify artist exists
        const artist = await db.artist.findById(artistId);
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        // Get all albums by this artist
        const albums = await db.album
          .find({
            artist: artistId,
            status: 'published',
            isPublic: true,
          })
          .sort({ releaseDate: -1 });
        // Get all tracks not in albums
        const singleTracks = await db.track
          .find({
            artist: artistId,
            album: { $exists: false },
            status: 'published',
            isPublic: true,
          })
          .sort({ releaseDate: -1 });
        res.json({
          artist,
          albums,
          singles: singleTracks,
        });
      } catch (error) {
        this.logger.error(`Error getting artist discography: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Verify an artist (admin only)
    async verifyArtist(req, res) {
      try {
        const artistId = req.params.artistId;
        // Check if user is admin
        if (!req.userRoles.includes('ROLE_ADMIN')) {
          return res.status(403).json({ error: 'Only administrators can verify artists' });
        }
        const artist = await db.artist.findById(artistId);
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        artist.isVerified = true;
        await artist.save();
        await this.cache.flush();
        res.json({ success: true, artist });
      } catch (error) {
        this.logger.error(`Error verifying artist: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Get related artists
    async getRelatedArtists(req, res) {
      try {
        const artistId = req.params.artistId;
        // Find genres of this artist
        const artist = await db.artist.findById(artistId);
        if (!artist) {
          return res.status(404).json({ error: 'Artist not found' });
        }
        // Get artists with similar genres
        const relatedArtists = await db.artist
          .find({
            _id: { $ne: artistId },
            genre: { $in: artist.genre },
            status: 'published',
          })
          .limit(5);
        res.json(relatedArtists);
      } catch (error) {
        this.logger.error(`Error getting related artists: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  }
  const artistController = new ArtistController(app, db);
  return {
    create: artistController.create.bind(artistController),
    read: artistController.read.bind(artistController),
    update: artistController.update.bind(artistController),
    delete: artistController.delete.bind(artistController),
    getDiscography: artistController.getDiscography.bind(artistController),
    verifyArtist: artistController.verifyArtist.bind(artistController),
    getRelatedArtists: artistController.getRelatedArtists.bind(artistController),
  };
});
