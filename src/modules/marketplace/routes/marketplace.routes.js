import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/marketplace.controller.js';

export default (function (app, db) {
  const controller = controllerFactory(db);
  const { authJwt } = middlewareFactoryAuth(db);

  /**
   * GET /api/marketplace/catalog
   * Public endpoint for marketplace catalog
   * Returns organizations with available products at nearby spots
   *
   * Query params:
   * - location: { coordinates: [lng, lat] } or JSON string
   * - locationRadius: number (km)
   * - address/city/state/country: for geocoding
   * - priceMin/priceMax: number
   * - delivery: comma-separated string or array
   * - payment: comma-separated string or array
   * - categories: comma-separated string or array
   * - isOpenNow: boolean
   * - sortParam: 'distance' | 'rating' | 'views' (default: 'distance')
   * - sortOrder: 'asc' | 'desc' (default: 'asc')
   * - skip: number (default: 0)
   * - limit: number (default: 18)
   */
  app.get(
    '/api/marketplace/catalog',
    [
      authJwt.verifyToken(true), // Optional authentication
    ],
    controller.readCatalog
  );
});
