<template>
  <div class="notifications-page pd-small">
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'all' }" 
        @click="activeTab = 'all'"
      >
        All Notifications {{ unreadCount > 0 ? `(${unreadCount})` : '' }}
      </button>
      <button 
        :class="{ active: activeTab === 'preferences' }" 
        @click="activeTab = 'preferences'"
      >
        Notification Settings
      </button>
    </div>
    
    <div class="tab-content">
      <notifications-list v-if="activeTab === 'all'" />
      <notification-preferences v-else-if="activeTab === 'preferences'" />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import NotificationsList from '../sections/NotificationsList.vue';
import NotificationPreferences from '../sections/NotificationPreferences.vue';

// Get route and notification state
const route = useRoute();
const { unreadCount } = inject('useNotifications')();

// Set initial active tab based on route query param or default to 'all'
const activeTab = ref(route.query.tab || 'all');
</script>

<style scoped>
.notifications-page {
}

.tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.tabs button {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  color: #666;
}

.tabs button.active {
  color: #2196F3;
  font-weight: 500;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2196F3;
}

.tab-content {
  padding: 16px 0;
}
</style>