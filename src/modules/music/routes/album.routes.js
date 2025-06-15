import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import album from '../controllers/album.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = album(app, db);
  const { authJwt } = middlewareFactoryAuth(db);
  // CRUD operations for albums
  app.post('/api/albums/create', [authJwt.verifyToken], controller.create);
  app.get('/api/albums/read', controller.read);
  app.put('/api/albums/update', [authJwt.verifyToken], controller.update);
  app.delete('/api/albums/delete', [authJwt.verifyToken], controller.delete);
  // Get album tracks
  app.get('/api/albums/:albumId/tracks', controller.getAlbumTracks);
  // Get featured albums
  app.get('/api/albums/featured', controller.getFeaturedAlbums);
  // Get album by URL
  app.get('/api/albums/url/:url', async (req, res) => {
    try {
      const album = await db.album.findOne({ url: req.params.url }).populate('artist');
      if (!album) {
        return res.status(404).json({ error: 'Album not found' });
      }
      res.json(album);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
