import BlogController from './controllers/blog.controller.js';
import CommentsController from './controllers/comments.controller.js';
import ReactionsController from './controllers/reactions.controller.js';
import BlogpostModel from './models/blogpost.model.js';
import CommentModel from './models/comment.model.js';
import ReactionModel from './models/reaction.model.js';
import blogRoutes from './routes/blog.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import reactionsRoutes from './routes/reactions.routes.js';
function initializeCommunity(app, db, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.blogpost = BlogpostModel(db);
  db.comment = CommentModel(db);
  db.reaction = ReactionModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    blogRoutes(app, db, origins, publicPath);
    commentsRoutes(app, db, origins, publicPath);
    reactionsRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  BlogpostModel,
  CommentModel,
  ReactionModel,
};
export const routes = {
  blogRoutes,
  commentsRoutes,
  reactionsRoutes,
};
export const controllers = {
  BlogController,
  CommentsController,
  ReactionsController,
};
export { initializeCommunity as initialize };
export default {
  initialize: initializeCommunity,
  models,
  routes,
  controllers,
};
