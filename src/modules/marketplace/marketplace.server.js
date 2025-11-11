import marketplaceRoutes from './routes/marketplace.routes.js';

function initializeMarketplace(app, db, origins, publicPath) {
  // Marketplace использует существующие модели (Spot, StockAvailability, Variant, Product, Organization)
  // Модели уже зарегистрированы в spots, inventory, products, organizations модулях

  // Настраиваем маршруты
  if (app) {
    marketplaceRoutes(app, db, origins, publicPath);
  }
}

export const routes = {
  marketplaceRoutes,
};

export const initialize = initializeMarketplace;

export default {
  initialize: initializeMarketplace,
  routes,
};
