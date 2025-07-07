import CategoryController from './controllers/categories.controller.js';
import ProductController from './controllers/products.controller.js';
import CategoryModel from './models/category.model.js';
import ProductModel from './models/product.model.js';
import VariantModel from './models/variant.model.js';
import categoriesRoutes from './routes/categories.routes.js';
import productsRoutes from './routes/products.routes.js';
import variantsRoutes from './routes/variants.routes.js';
function initializeProduct(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.product = ProductModel(db);
  db.variant = VariantModel(db);
  db.category = CategoryModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    productsRoutes(app, db, origins, publicPath);
    categoriesRoutes(app, db, origins, publicPath);
    variantsRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  ProductModel,
  CategoryModel,
};
export const routes = {
  productsRoutes,
  categoriesRoutes,
};
export const controllers = {
  ProductController,
  CategoryController,
};
export { initializeProduct as initialize };
export default {
  initialize: initializeProduct,
  models,
  routes,
  controllers,
};
