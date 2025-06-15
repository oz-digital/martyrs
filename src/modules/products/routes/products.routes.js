import controllerFactory from '../controllers/products.controller.js';
export default (function (app, db, allowedOrigins) {
  const controller = controllerFactory(db);
  // (C) Create product
  app.post('/api/products/create', controller.Create);
  // (R) Read products
  app.get('/api/products/read', controller.Read);
  // (U) Update product
  app.post('/api/products/:_id', controller.Update);
  // (D) Delete product
  app.delete('/api/products/:_id', controller.Delete);
  app.post('/api/product/recommended', controller.getProductRecommendation);
});
