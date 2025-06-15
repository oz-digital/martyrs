import GalleryController from './controllers/gallery.controller.js';
import PhotoModel from './models/photo.model.js';
import galleryRoutes from './routes/gallery.routes.js';
function initializeGallery(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.photo = PhotoModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    galleryRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  PhotoModel,
};
export const routes = {
  galleryRoutes,
};
export const controllers = {
  GalleryController,
};
export { initializeGallery as initialize };
export default {
  initialize: initializeGallery,
  models,
  routes,
  controllers,
};
