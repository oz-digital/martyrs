import CategoryController from './controllers/categories.controller.js';
import LeftoverController from './controllers/leftovers.controller.js';
import ProductController from './controllers/products.controller.js';
import CategoryModel from './models/category.model.js';
import LeftoverModel from './models/leftover.model.js';
import ProductModel from './models/product.model.js';
import VariantModel from './models/variant.model.js';
import categoriesRoutes from './routes/categories.routes.js';
import leftoversRoutes from './routes/leftovers.routes.js';
import productsRoutes from './routes/products.routes.js';
import variantsRoutes from './routes/variants.routes.js';
function initializeProduct(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.product = ProductModel(db);
  db.variant = VariantModel(db);
  db.category = CategoryModel(db);
  db.leftover = LeftoverModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    productsRoutes(app, db, origins, publicPath);
    categoriesRoutes(app, db, origins, publicPath);
    leftoversRoutes(app, db, origins, publicPath);
    variantsRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  ProductModel,
  CategoryModel,
  LeftoverModel,
};
export const routes = {
  productsRoutes,
  categoriesRoutes,
  leftoversRoutes,
};
export const controllers = {
  ProductController,
  CategoryController,
  LeftoverController,
};
export { initializeProduct as initialize };
export default {
  initialize: initializeProduct,
  models,
  routes,
  controllers,
};
