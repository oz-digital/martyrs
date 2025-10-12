import mailing from '@martyrs/src/modules/core/controllers/utils/mailing.js';
const { sendChatMessageTelegram } = mailing;

const controllerFactory = db => {
  const ChatMessage = db.chat;
  const Department = db.department;
  const Order = db.order;
  
  // Хранилище таймеров для отложенных нотификаций
  const notificationTimers = new Map();
  const NOTIFICATION_DELAY = 3000; // 30 секунд
  
  const saveMessage = async msg => {
    try {
      const message = new ChatMessage(msg);
      await message.save();
      console.log('[CHAT CONTROLLER] Saved message with userId:', msg.userId);
      return message;
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };
  
  const getMessages = async chatId => {
    try {
      const messages = await ChatMessage.find({ chatId }).sort({ createdAt: 1 });
      return messages;
    } catch (error) {
      console.error('Error retrieving messages from database:', error);
    }
  };
  
  const markMessagesAsRead = async (messageIds, userId) => {
    try {
      console.log('[CHAT CONTROLLER] markMessagesAsRead called:', { messageIds, userId });
      
      // Сначала проверим сообщения
      const messages = await ChatMessage.find({ _id: { $in: messageIds } });
      console.log('[CHAT CONTROLLER] Found messages to mark:', messages.map(m => ({
        id: m._id,
        userId: m.userId,
        isOwnMessage: m.userId?.toString() === userId.toString(),
        alreadyRead: m.readBy?.some(r => r.userId.toString() === userId.toString())
      })));
      
      // Обновляем только чужие непрочитанные сообщения
      const result = await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          userId: { $ne: userId }, // НЕ свои сообщения
          'readBy.userId': { $ne: userId } // еще не прочитанные
        },
        {
          $push: {
            readBy: {
              userId: userId,
              readAt: new Date()
            }
          }
        }
      );
      
      console.log('[CHAT CONTROLLER] Mark as read result:', result);
      return result;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Получить пользователей с доступом orders.confirm для организации
  const getUsersWithOrdersConfirmAccess = async (organizationId) => {
    const pipeline = [
      { $match: { 
        organization: new db.mongoose.Types.ObjectId(organizationId),
        'accesses.orders.confirm': true 
      }},
      { $unwind: '$members' },
      { $group: {
        _id: '$members.user'
      }},
      { $project: { userId: '$_id' }}
    ];
    
    const result = await Department.aggregate(pipeline);
    return result.map(item => item.userId);
  };
  
  // Отправка нотификаций (как в orders.controller)
  const sendChatNotifications = async (message, recipientIds) => {
    if (!recipientIds || recipientIds.length === 0) return;
    
    const notifications = recipientIds.map(userId => ({
      title: 'New Message',
      body: `${message.username}: ${message.text.substring(0, 100)}`,
      type: 'chat_message',
      metadata: {
        type: 'chat_message',
        chatId: message.chatId,
        messageId: message._id,
        context: 'chat'
      },
      userId: userId
    }));
    
    try {
      const response = await fetch(`${process.env.API_URL || ''}/api/notifications/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': process.env.SERVICE_KEY,
        },
        body: JSON.stringify({ notifications }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Notification API failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Chat notifications sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send chat notifications:', error);
    }
  };
  
  // Запланировать отправку нотификаций
  const scheduleNotifications = async (message, wss, senderUserId) => {
    console.log('[CHAT CONTROLLER] scheduleNotifications called for message:', message);
    console.log('[CHAT CONTROLLER] Sender userId:', senderUserId);
    console.log('[CHAT CONTROLLER] Chat type:', message.chatType);
    console.log('[CHAT CONTROLLER] Chat ID:', message.chatId);
    
    // Определяем получателей в зависимости от типа чата
    let recipientIds = [];
    
    if (message.chatType === 'order') {
      // Для чатов типа order - chatId это ID заказа
      try {
        const order = await Order.findById(message.chatId);
        console.log('[CHAT CONTROLLER] Found order:', order?._id, 'Owner:', order?.owner);
        
        const organizationId = order?.owner?.target?._id || order?.owner?.target;
        
        if (order && organizationId) {
          console.log('[CHAT CONTROLLER] Looking for users with orders.confirm access in org:', organizationId);
          recipientIds = await getUsersWithOrdersConfirmAccess(organizationId);
          console.log('[CHAT CONTROLLER] Found recipient IDs:', recipientIds);
        } else {
          console.log('[CHAT CONTROLLER] Order not found or has no organization');
        }
      } catch (error) {
        console.error('[CHAT CONTROLLER] Error fetching order:', error);
      }
    } else if (message.chatType === 'group') {
      // Групповые нотификации замокированы
      console.log('[CHAT CONTROLLER] Group notifications are mocked for now');
      return;
    } else {
      console.log('[CHAT CONTROLLER] Unknown chat type:', message.chatType);
      return;
    }
    
    // Исключаем отправителя из списка получателей
    const filteredRecipientIds = recipientIds.filter(userId => 
      userId.toString() !== senderUserId?.toString()
    );
    
    console.log('[CHAT CONTROLLER] Recipients after filtering out sender:', filteredRecipientIds);
    
    if (filteredRecipientIds.length === 0) {
      console.log('[CHAT CONTROLLER] No recipients after filtering, skipping notifications');
      return;
    }
    
    // Планируем отправку через 30 секунд для каждого получателя
    filteredRecipientIds.forEach(userId => {
      const timerKey = `${message._id}_${userId}`;
      console.log(`[CHAT CONTROLLER] Setting timer for user ${userId}, key: ${timerKey}`);
      
      const timer = setTimeout(async () => {
        console.log(`[CHAT CONTROLLER] Timer fired for user ${userId}, checking if message is read`);
        
        // Проверяем, не прочитано ли сообщение
        const currentMessage = await ChatMessage.findById(message._id);
        const isRead = currentMessage.readBy.some(r => r.userId.toString() === userId.toString());
        
        console.log(`[CHAT CONTROLLER] Message read status for user ${userId}:`, isRead);
        
        if (!isRead) {
          console.log(`[CHAT CONTROLLER] Sending notification to user ${userId}`);
          await sendChatNotifications(message, [userId]);
        } else {
          console.log(`[CHAT CONTROLLER] Message already read by user ${userId}, skipping notification`);
        }
        
        notificationTimers.delete(timerKey);
      }, NOTIFICATION_DELAY);
      
      notificationTimers.set(timerKey, timer);
    });
  };
  
  return {
    saveMessage,
    getMessages,
    markMessagesAsRead,
    scheduleNotifications,
    notificationTimers
  };
};

export default controllerFactory;
