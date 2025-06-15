// Store
import * as storeChatModule from './store/chat.store.js';

// Router
// import { createChatRoutes } from './router/chat.router.js';

// Views
// Pages
import ChatPage from './components/pages/ChatPage.vue';

// Sections
import ChatWindow from './components/sections/ChatWindow.vue';

// Blocks
import ChatMessage from './components/blocks/ChatMessage.vue';

// Пример функции инициализации для модуля чатов
function initializeChats(app, store, router, options = {}) {
  const route = options.route || 'Home';

  // const routesChat = createChatRoutes();

  // router.addRoute(route, routesChat);

  store.addStore('chat', storeChatModule);
}

const ModuleChats = {
  initialize: initializeChats,
  views: {
    store: {
      storeChatModule,
    },
    router: {
      // createChatRoutes
    },
    components: {
      // Pages
      ChatPage,
      // Sections
      ChatWindow,
      // Blocks
      ChatMessage,
    },
  },
};

export default ModuleChats;
