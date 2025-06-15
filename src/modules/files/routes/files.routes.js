import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/files.controller.js';
import middlewareFactoryFiles from '../middlewares/server/index.js';
export default (function (app, db, origins, publicPath) {
  const controller = controllerFactory(db, publicPath);
  const { authJwt } = middlewareFactoryAuth(db);
  const { middlewareBusboy } = middlewareFactoryFiles(db, publicPath);
  app.post(
    '/api/upload/image',
    [middlewareBusboy.uploadImagesMiddleware, middlewareBusboy.convertImagesMiddleware, middlewareBusboy.generatePreviewMiddleware],
    controller.uploadMultipleFileController
  );
  app.post('/api/upload/audio', [middlewareBusboy.uploadAudioMiddleware], controller.uploadMultipleFileController);
  app.post(
    '/api/upload/multiple',
    [middlewareBusboy.uploadImagesMiddleware, middlewareBusboy.convertImagesMiddleware, middlewareBusboy.generatePreviewMiddleware],
    controller.uploadMultipleFileController
  );
  // app.post(
  //   "/api/upload/videos",
  //   [
  //     middlewareBusboy.uploadVideosMiddleware,
  //     middlewareBusboy.generatePreviewMiddleware
  //   ],
  //   controller.uploadMultipleFileController
  // );
  app.post('/api/upload/file', [middlewareBusboy.uploadFilesMiddleware], controller.uploadMultipleFileController);
});
