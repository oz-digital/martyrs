import music from './music.controller.js';
export default (function (app, db) {
  const { MusicController } = music(app, db);
  class GenreController extends MusicController {
    constructor(app) {
      super('/api/genres', app, db, db.genre);
    }
    // Get tracks by genre
    async getGenreTracks(req, res) {
      try {
        const genreId = req.params.genreId;
        // Verify genre exists
        const genre = await db.genre.findById(genreId);
        if (!genre) {
          return res.status(404).json({ error: 'Genre not found' });
        }
        // Get tracks from this genre
        const tracks = await db.track
          .find({
            genre: genreId,
            status: 'published',
            isPublic: true,
          })
          .sort({ releaseDate: -1 })
          .limit(50)
          .populate('artist', 'name')
          .populate('album', 'title coverUrl');
        res.json({
          genre,
          tracks,
        });
      } catch (error) {
        this.logger.error(`Error getting genre tracks: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
    // Get popular genres
    async getPopularGenres(req, res) {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const genres = await db.genre
          .find({
            status: 'published',
          })
          .sort({ popularity: -1 })
          .limit(limit);
        res.json(genres);
      } catch (error) {
        this.logger.error(`Error getting popular genres: ${error.message}`);
        res.status(500).json({ error: error.message });
      }
    }
  }
  const genreController = new GenreController(app, db);
  return {
    create: genreController.create.bind(genreController),
    read: genreController.read.bind(genreController),
    update: genreController.update.bind(genreController),
    delete: genreController.delete.bind(genreController),
    getGenreTracks: genreController.getGenreTracks.bind(genreController),
    getPopularGenres: genreController.getPopularGenres.bind(genreController),
  };
});
