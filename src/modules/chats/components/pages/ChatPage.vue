<template>
  <main class="chat-main">
    <ChatWindow />
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ChatWindow from '../sections/ChatWindow.vue';
import chatStore from '../../store/chat.store.js';

const props = defineProps({
  username: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  chatID: {
    type: String,
    required: true
  },
});

const selectChat = (chatId) => {
  chatStore.methods.setCurrentChat(chatId);
};

onMounted(async () => {
  chatStore.methods.setUsername(props.username || 'user'); // Установка имени пользователя
  await chatStore.methods.connectWebSocket(props.user); // Подключение к WebSocket
  await chatStore.methods.setCurrentChat(props.chatID);
});

onUnmounted(() => {
  // Clean up when the component is unmounted (e.g., navigating away)
  chatStore.methods.disconnectChat();
});
</script>

<style>
/* Стили остаются без изменений */
</style>