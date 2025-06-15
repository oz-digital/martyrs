import search from '../controllers/search.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = search(app, db);
  // Search API endpoint
  app.get('/api/music/search', controller.search);
});
