import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';
import { reactive, readonly } from 'vue';

const state = reactive({
  messages: [],
  currentChatId: null,
  username: null,
});

const methods = {
  /**
   * Подключение к глобальному WebSocket и подписка на чат
   * @param {String} userId
   */
  async connectWebSocket(userId) {
    try {
      console.log('[Chat] Connecting to WebSocket with userId:', userId);
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
