import music from './music.controller.js';
export default (function (app, db) {
  const { MusicController } = music(app, db);
  class AlbumController extends MusicController {
    constructor(app) {
      super('/api/albums', app, db, db.album);
    }
    // Get tracks for a specific album
    async getAlbumTracks(req, res) {
      try {
        const albumId = req.params.albumId;
        // Check if album exists and user has access
        const album = await db.album.findById(albumId);
        if (!album) {
          return res.status(404).json({ error: 'Album not found' });
        }
        // Check access using ABAC
        const accessResult = await this.abac.checkAccess({
          user: req.userId,
          resource: 'albums',
          action: 'read',
          currentResource: album,
        });
        if (!accessResult.allowed && !album.isPublic) {
          return res.status(403).json({
            errorCode: accessResult.reason,
            message: 'Access Denied',
          });
        }
        // Find tracks for this album
        const tracks = await db.track.find({ album: albumId, status: 'published' }).sort({ releaseDate: -1 });
        res.json(tracks);
      } catch (error) {
        this.logger.error(`Error getting album tracks: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Get featured albums
    async getFeaturedAlbums(req, res) {
      try {
        const cacheKey = 'featured-albums';
        let featuredAlbums = await this.cache.get(cacheKey);
        if (!featuredAlbums) {
          // Get featured albums with track counts
          featuredAlbums = await db.album.aggregate([
            { $match: { status: 'featured', isPublic: true } },
            {
              $lookup: {
                from: 'tracks',
                localField: '_id',
                foreignField: 'album',
                as: 'tracks',
              },
            },
            {
              $addFields: {
                trackCount: { $size: '$tracks' },
              },
            },
            { $project: { tracks: 0 } },
            { $sort: { releaseDate: -1 } },
            { $limit: 10 },
          ]);
          await this.cache.set(cacheKey, featuredAlbums, 3600); // Cache for 1 hour
        }
        res.json(featuredAlbums);
      } catch (error) {
        this.logger.error(`Error getting featured albums: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  }
  const albumController = new AlbumController(app, db); // Pass app in actual implementation
  return {
    create: albumController.create.bind(albumController),
    read: albumController.read.bind(albumController),
    update: albumController.update.bind(albumController),
    delete: albumController.delete.bind(albumController),
    getAlbumTracks: albumController.getAlbumTracks.bind(albumController),
    getFeaturedAlbums: albumController.getFeaturedAlbums.bind(albumController),
  };
});
