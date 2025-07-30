import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';
import { reactive, readonly } from 'vue';

const state = reactive({
  messages: [],
  currentChatId: null,
  username: null,
  userId: null,
});

const methods = {
  /**
   * Подключение к глобальному WebSocket и подписка на чат
   * @param {String} userId
   */
  async connectWebSocket(userId) {
    try {
      console.log('[Chat] Connecting to WebSocket with userId:', userId);
      state.userId = userId; // Сохраняем userId
      await globalWebSocket.connect(userId);
      await globalWebSocket.subscribeModule('chat'); // 👈 Подписка на модуль чата

      // Очистка старых листенеров
      globalWebSocket.removeModuleListeners('chat');

      // Добавляем обработчик входящих сообщений
      globalWebSocket.addEventListener(
        'message',
        data => {
          if (data.chatId === state.currentChatId) {
            state.messages.push(data);
          }
        },
        { module: 'chat' }
      );
      
      // Обработчик подтверждения прочтения
      globalWebSocket.addEventListener(
        'readReceipt',
        data => {
          console.log('[CHAT STORE] Received readReceipt:', data);
          
          // Обновляем статус прочтения для сообщений
          if (data.messageIds && data.userId) {
            data.messageIds.forEach(messageId => {
              const message = state.messages.find(m => m._id === messageId);
              if (message) {
                if (!message.readBy) {
                  message.readBy = [];
                }
                // Добавляем запись о прочтении если её еще нет
                if (!message.readBy.some(r => r.userId === data.userId)) {
                  message.readBy.push({
                    userId: data.userId,
                    readAt: data.readAt || new Date()
                  });
                  console.log('[CHAT STORE] Updated message read status:', messageId);
                }
              }
            });
          }
        },
        { module: 'chat' }
      );
    } catch (error) {
      console.error('[Chat] WebSocket connection failed:', error);
      throw error;
    }
  },

  /**
   * Установка текущего активного чата и загрузка сообщений
   * @param {String} chatId
   */
  async setCurrentChat(chatId) {
    state.currentChatId = chatId;
    state.messages = [];

    // Отправляем joinChat через WebSocket
    globalWebSocket.send({ type: 'joinChat', module: 'chat', chatId });

    // Загружаем историю сообщений
    try {
      const response = await fetch(`/messages/${chatId}`);
      const messages = await response.json();
      methods.setMessages(messages);
    } catch (err) {
      console.error('[Chat] Failed to fetch messages:', err);
    }
  },

  /**
   * Установка сообщений
   * @param {Array} messages
   */
  setMessages(messages) {
    state.messages = messages;
  },

  /**
   * Отправка сообщения через WebSocket
   * @param {Object} message
   */
  async addMessage(message) {
    await globalWebSocket.send({
      ...message,
      module: 'chat',
      type: 'message',
      chatId: state.currentChatId,
      chatType: 'order', // TODO: динамически определять тип чата
      userId: state.userId, // Добавляем userId отправителя
    });
  },

  /**
   * Отметить сообщения как прочитанные
   * @param {Array<String>} messageIds
   */
  async markMessagesAsRead(messageIds) {
    console.log('[CHAT STORE] markMessagesAsRead called with:', messageIds);
    console.log('[CHAT STORE] Current userId:', state.userId);
    
    // Обновляем локальное состояние сразу для текущего пользователя
    messageIds.forEach(messageId => {
      const message = state.messages.find(m => m._id === messageId);
      if (message) {
        if (!message.readBy) {
          message.readBy = [];
        }
        // Добавляем запись о прочтении если её еще нет
        if (!message.readBy.some(r => r.userId === state.userId)) {
          message.readBy.push({
            userId: state.userId,
            readAt: new Date()
          });
          console.log('[CHAT STORE] Locally updated message read status:', messageId);
        }
      }
    });
    
    await globalWebSocket.send({
      type: 'markAsRead',
      module: 'chat',
      messageIds: messageIds,
      chatId: state.currentChatId,
    });
  },

  /**
   * Установка имени пользователя
   * @param {String} username
   */
  setUsername(username) {
    state.username = username;
  },

  /**
   * Отключение от чата (очистка листенеров)
   */
  disconnectChat() {
    globalWebSocket.removeModuleListeners('chat');
    // globalWebSocket.disconnect(); // включить, если нужно полностью разорвать соединение
  },
};

export default {
  state: readonly(state),
  methods,
};
