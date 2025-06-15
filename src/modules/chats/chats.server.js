import ChatsController from './controllers/chats.controller.js';
import ChatModel from './models/chat.model.js';
import chatsRoutes from './routes/chats.routes.js';
function initializeChats(app, db, wss, origins, publicPath) {
  // Настраиваем модели в объекте базы данных
  db.chat = ChatModel(db);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    chatsRoutes(app, db, wss, origins, publicPath);
  }
}
export const models = {
  ChatModel,
};
export const routes = {
  chatsRoutes,
};
export const controllers = {
  ChatsController,
};
export { initializeChats as initialize };
export default {
  initialize: initializeChats,
  models,
  routes,
  controllers,
};
