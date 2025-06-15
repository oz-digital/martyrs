import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import artist from '../controllers/artist.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = artist(app, db);
  const { authJwt } = middlewareFactoryAuth(db);
  // CRUD operations for artists
  app.post('/api/artists/create', [authJwt.verifyToken], controller.create);
  app.get('/api/artists/read', controller.read);
  app.put('/api/artists/update', [authJwt.verifyToken], controller.update);
  app.delete('/api/artists/delete', [authJwt.verifyToken], controller.delete);
  // Get artist discography
  app.get('/api/artists/:artistId/discography', controller.getDiscography);
  // Verify artist (admin only)
  app.put('/api/artists/:artistId/verify', [authJwt.verifyToken, authJwt.isAdmin], controller.verifyArtist);
  // Get related artists
  app.get('/api/artists/:artistId/related', controller.getRelatedArtists);
  // Get artist by URL
  app.get('/api/artists/url/:url', async (req, res) => {
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
  });
});
