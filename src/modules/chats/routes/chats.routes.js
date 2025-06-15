import middlewareFactory from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/chats.controller.js';
export default (function (app, db, wss) {
  const controller = controllerFactory(db);
  const { verifySignUp, verifyUser } = middlewareFactory(db);
  // WebSocket-обработчик для модуля "chat"
  wss.registerModule('chat', async (ws, msg) => {
    if (msg.type === 'joinChat') {
      if (!msg.chatId) return;
      // Вешаем chatId на сокет — позволяет фильтровать клиентов
      if (!ws.activeChats) ws.activeChats = new Set();
      ws.activeChats.add(msg.chatId);
    }
    if (msg.type === 'message') {
      const savedMessage = await controller.saveMessage(msg);
      // Отправить сообщение всем в этом чате
      wss.broadcastToModuleWithFilter(
        'chat',
        client => {
          return client.activeChats?.has(msg.chatId);
        },
        savedMessage
      );
    }
  });
  // REST API: получить историю сообщений
  app.get('/messages/:chatId', async (req, res) => {
    const { chatId } = req.params;
    const messages = await controller.getMessages(chatId);
    res.json(messages);
  });
  // CORS-заголовки
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin: *', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });
});
