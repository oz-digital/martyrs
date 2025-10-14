<template>
  <div class="notifications-layout">
    <div class="">
      <router-view></router-view>
    </div>
    
    <div v-if="!wsConnected" class="connection-status">
      <div class="connection-warning">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">
          Notification service disconnected. 
          <button @click="reconnect" class="reconnect-btn">Reconnect</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, onMounted, onUnmounted } from 'vue';
import wsManager from '@martyrs/src/modules/core/views/classes/ws.manager.js';

// Get notification manager from store
const store = inject('store');

const notificationManager = computed(() => store.notificationManager || null);

// Реактивное состояние WebSocket
const wsConnected = ref(wsManager.isConnected);

// ID слушателей для очистки
const openListenerId = ref(null);
const closeListenerId = ref(null);

onMounted(() => {
  // Подписываемся на события WebSocket
  openListenerId.value = wsManager.addEventListener('open', () => {
    wsConnected.value = true;
  });
  
  closeListenerId.value = wsManager.addEventListener('close', () => {
    wsConnected.value = false;
  });
  
  // Устанавливаем начальное состояние
  wsConnected.value = wsManager.isConnected;
});

onUnmounted(() => {
  // Очищаем слушатели
  if (openListenerId.value) {
    wsManager.removeEventListener('open', openListenerId.value);
  }
  if (closeListenerId.value) {
    wsManager.removeEventListener('close', closeListenerId.value);
  }
});


// Methods
const reconnect = () => {
  if (notificationManager.value) {
    notificationManager.value.initialize();
  }
};
</script>

<style scoped>
</style>