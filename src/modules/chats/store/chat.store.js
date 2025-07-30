import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';
import { reactive, readonly } from 'vue';

const state = reactive({
  messages: [],
  currentChatId: null,
  username: null,
  userId: null,
  anonymousId: null,
});

const methods = {
  /**
   * Подключение к глобальному WebSocket и подписка на чат
   * @param {String} userId - optional userId for authenticated users
   */
  async connectWebSocket(userId = null) {
    try {
      console.log('[Chat] Connecting to WebSocket with userId:', userId);
      state.userId = userId; // Сохраняем userId (может быть null для анонимных)
      
      // Generate anonymousId for anonymous users
      if (!userId) {
        // Try to get existing anonymousId from localStorage
        let anonymousId = localStorage.getItem('chat_anonymous_id');
        if (!anonymousId) {
          anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('chat_anonymous_id', anonymousId);
        }
        state.anonymousId = anonymousId;
        console.log('[Chat] Using anonymousId:', anonymousId);
      }
      
      // WebSocket уже подключен в globals.client.js, просто подписываемся на модуль
      console.log('[Chat Store] Subscribing to chat module...');
      
      // Очистка старых листенеров ДО подписки, чтобы избежать дублирования
      globalWebSocket.removeModuleListeners('chat');
      
      await globalWebSocket.subscribeModule('chat'); // 👈 Подписка на модуль чата
      console.log('[Chat Store] Subscribed to chat module');

      // Добавляем обработчик входящих сообщений
      globalWebSocket.addEventListener(
        'message',
        data => {
          console.log('[Chat Store] Received message:', data);
          console.log('[Chat Store] Current chatId:', state.currentChatId);
          console.log('[Chat Store] Message chatId:', data.chatId);
          
          if (data.chatId === state.currentChatId) {
            console.log('[Chat Store] Adding message to state');
            state.messages.push(data);
          } else {
            console.log('[Chat Store] Message is for different chat, ignoring');
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
    console.log('[Chat Store] Setting current chat to:', chatId);
    state.currentChatId = chatId;
    state.messages = [];

    // Отправляем joinChat через WebSocket
    const joinMessage = { type: 'joinChat', module: 'chat', chatId };
    console.log('[Chat Store] Sending joinChat:', joinMessage);
    await globalWebSocket.send(joinMessage);

    // Загружаем историю сообщений
    try {
      const response = await fetch(`/messages/${chatId}`);
      const messages = await response.json();
      console.log('[Chat Store] Loaded messages:', messages.length);
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
    const messageData = {
      ...message,
      module: 'chat',
      type: 'message',
      chatId: state.currentChatId,
      chatType: 'order', // TODO: динамически определять тип чата
    };
    
    // Add userId or anonymousId
    if (state.userId) {
      messageData.userId = state.userId;
    } else if (state.anonymousId) {
      messageData.anonymousId = state.anonymousId;
    }
    
    console.log('[Chat Store] Sending message:', messageData);
    const sendResult = await globalWebSocket.send(messageData);
    console.log('[Chat Store] Send result:', sendResult);
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
