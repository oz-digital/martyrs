import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import genre from '../controllers/genre.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = genre(app, db);
  const { authJwt } = middlewareFactoryAuth(db);
  // CRUD operations for genres
  app.post('/api/genres/create', [authJwt.verifyToken, authJwt.isAdmin], controller.create);
  app.get('/api/genres/read', controller.read);
  app.put('/api/genres/update', [authJwt.verifyToken, authJwt.isAdmin], controller.update);
  app.delete('/api/genres/delete', [authJwt.verifyToken, authJwt.isAdmin], controller.delete);
  // Get tracks by genre
  app.get('/api/genres/:genreId/tracks', controller.getGenreTracks);
  // Get popular genres
  app.get('/api/genres/popular', controller.getPopularGenres);
  // Get genre by URL
  app.get('/api/genres/url/:url', async (req, res) => {
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
  });
});
