import middlewareFactory from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/chats.controller.js';
export default (function (app, db, wss) {
  const controller = controllerFactory(db);
  const { verifySignUp, verifyUser } = middlewareFactory(db);


  // WebSocket-обработчик для модуля "chat"
  if (wss) {
    wss.registerModule('chat', async (ws, msg) => {
    console.log('[CHAT WebSocket] Received message type:', msg.type, 'from ws.id:', ws.id);
    
    if (msg.type === 'joinChat') {
      console.log('[CHAT WebSocket] joinChat request for chatId:', msg.chatId);
      if (!msg.chatId) {
        console.log('[CHAT WebSocket] No chatId provided for joinChat');
        return;
      }
      // Вешаем chatId на сокет — позволяет фильтровать клиентов
      if (!ws.activeChats) ws.activeChats = new Set();
      ws.activeChats.add(msg.chatId);
      console.log('[CHAT WebSocket] Client', ws.id, 'joined chat:', msg.chatId);
      console.log('[CHAT WebSocket] Client activeChats:', Array.from(ws.activeChats));
    }
    
    if (msg.type === 'message') {
      console.log('[CHAT] Received message:', msg);
      
      // Add userId or anonymousId from WebSocket connection
      const messageData = {
        ...msg,
        userId: ws.userId || undefined,
        anonymousId: ws.anonymousId || undefined
      };
      
      const savedMessage = await controller.saveMessage(messageData);
      console.log('[CHAT] Saved message:', savedMessage);
      
      // Отправить сообщение всем в этом чате
      wss.broadcastToModuleWithFilter(
        'chat',
        client => {
          return client.activeChats?.has(msg.chatId);
        },
        savedMessage
      );
      
      // Запланировать отправку нотификаций через 30 секунд
      console.log('[CHAT] Scheduling notifications for message:', savedMessage._id, 'from user:', ws.userId);
      controller.scheduleNotifications(savedMessage, wss, ws.userId);
    }
    
    if (msg.type === 'markAsRead') {
      console.log('[CHAT] markAsRead request:', { messageIds: msg.messageIds, userId: ws.userId });
      
      if (!msg.messageIds || !msg.chatId || !ws.userId) {
        console.log('[CHAT] markAsRead missing params:', { hasMessageIds: !!msg.messageIds, hasChatId: !!msg.chatId, hasUserId: !!ws.userId });
        return;
      }
      
      // Отметить сообщения как прочитанные
      const updatedMessages = await controller.markMessagesAsRead(msg.messageIds, ws.userId);
      
      // Отменить запланированные нотификации для этого пользователя
      msg.messageIds.forEach(messageId => {
        const timerKey = `${messageId}_${ws.userId}`;
        if (controller.notificationTimers.has(timerKey)) {
          clearTimeout(controller.notificationTimers.get(timerKey));
          controller.notificationTimers.delete(timerKey);
        }
      });
      
      // Уведомить других участников чата о прочтении
      wss.broadcastToModuleWithFilter(
        'chat',
        client => {
          return client.activeChats?.has(msg.chatId) && client.userId !== ws.userId;
        },
        {
          type: 'readReceipt',
          messageIds: msg.messageIds,
          userId: ws.userId,
          readAt: new Date()
        }
      );
    }
    });
  }
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
