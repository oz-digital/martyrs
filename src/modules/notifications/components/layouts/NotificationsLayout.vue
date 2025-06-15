<template>
  <div class="notifications-layout">
    <div >
    </div>  
    
    <div class="">
      <router-view></router-view>
    </div>
    
    <div v-if="notificationManager && !isConnected" class="connection-status">
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
import { computed, inject } from 'vue';

// Get notification manager from store
const store = inject('store');

const notificationManager = computed(() => store.notificationManager || null);

const isConnected = computed(() => {
  return notificationManager.value?.wsHandler?.isConnected || false;
});

// Methods
const reconnect = () => {
  if (notificationManager.value) {
    notificationManager.value.initialize();
  }
};
</script>

<style scoped>
.notifications-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  border-bottom: 2px solid var(--primary-color, #0066cc);
  color: var(--primary-color, #0066cc);
}

</style>