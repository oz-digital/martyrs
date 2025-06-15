<template>
  <div class="notification-badge-container">
    <button 
      class="i-semi notification-button"
      @click="toggleNotifications"
      :aria-label="unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'"
    >
      <IconBell class="notification-icon i-medium" :fill="fill"/>
      <div  
        v-if="unreadCount > 0" 
        class="button-counter flex-center"
      >
        <span>{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </div>
    </button>
    <div v-if="isOpen" class="notifications-dropdown">
      <div class="notifications-header">
        <h3>Notifications</h3>
        <button 
          v-if="unreadCount > 0" 
          class="mark-all-read-btn" 
          @click="markAllAsRead"
        >
          Mark all read
        </button>
      </div>
      <div v-if="loading" class="notifications-loading">
        Loading...
      </div>
      <div v-else-if="notifications.length === 0" class="notifications-empty">
        No notifications
      </div>
      <div v-else class="notifications-list">
        <notification-item 
          v-for="notification in recentNotifications" 
          :key="notification._id" 
          :notification="notification"
          @click="handleNotificationClick(notification)"
        />
      </div>
      <div class="notifications-footer">
        <router-link to="/notifications" @click="isOpen = false">
          View all notifications
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import NotificationItem from '../blocks/NotificationItem.vue';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

import IconBell from '@martyrs/src/modules/icons/entities/IconBell.vue';

const props = defineProps({
  maxNotifications: {
    type: Number,
    default: 5
  },
  fill: {
    type: String,
    default: 'rgb(var(--white))'
  }
});

// Get router and notification functionality
const router = useRouter();
const { notifications, unreadCount, loading, markAllAsRead, getNotifications } = inject('useNotifications')();

// Local state
const isOpen = ref(false);

// Computed properties
const recentNotifications = computed(() => {
  return notifications.value
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, props.maxNotifications);
});

// Methods
const toggleNotifications = () => {
  isOpen.value = !isOpen.value;
};

const handleNotificationClick = (notification) => {
  isOpen.value = false;
  
  if (notification._id) {
    // Handle in store
    actions.handleNotificationAction({
      notificationId: notification._id,
      ...notification.metadata
    });
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const container = document.querySelector('.notification-badge-container');
  if (container && !container.contains(event.target)) {
    isOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Load notifications when component mounts
  const userId = auth.state.user._id;
  if (userId) {
    getNotifications(userId);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-badge-container {
  position: relative;
  display: inline-block;
}

.notification-button {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
}

.notification-icon {
  font-size: 1.4rem;
}
.button-counter {
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: rgb(var(--fourth));
  color: rgb(var(--white));
  height: 16px;
  border-radius: 16px;
  width: 16px;
  font-weight: 500;
  text-align: center;
  line-height: 16px;
  font-size: 10px;
}
.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #2196f3;
  font-size: 0.8rem;
  cursor: pointer;
}

.notifications-loading,
.notifications-empty {
  padding: 24px;
  text-align: center;
  color: #666;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notifications-footer {
  padding: 12px 16px;
  text-align: center;
  border-top: 1px solid #eee;
}

.notifications-footer a {
  color: #2196f3;
  text-decoration: none;
  font-size: 0.9rem;
}
</style>