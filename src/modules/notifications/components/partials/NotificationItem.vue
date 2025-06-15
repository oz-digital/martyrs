<template>
  <div 
    class="notification-item" 
    :class="{ 'unread': notification.status !== 'read' }" 
    @click="handleClick"
  >
    <div class="notification-icon" :class="notification.type">
      {{ getIconForType(notification.type) }}
    </div>
    <div class="notification-content">
      <div class="notification-title">{{ notification.title }}</div>
      <div class="notification-body">{{ notification.body }}</div>
      <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
    </div>
    <button 
      v-if="notification.status !== 'read'" 
      class="mark-read-btn" 
      @click.stop="markAsRead(notification._id)"
      aria-label="Mark as read"
    >
      ✓
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

// Get notification actions from provided store
const { markAsRead } = inject('useNotifications')();

// Methods
const handleClick = () => {
  if (props.notification.status !== 'read') {
    markAsRead(props.notification._id);
  }
  emit('click', props.notification);
};

// Get emoji icon based on notification type
const getIconForType = (type) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'danger':
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    case 'message':
      return '💬';
    case 'order':
      return '🛒';
    case 'payment':
      return '💰';
    case 'update':
      return '🔄';
    default:
      return '🔔';
  }
};

// Format relative time without external libraries
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffSeconds = Math.floor((now - date) / 1000);
  
  // Format based on how long ago
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    // Format date string
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
</script>

<style scoped>
.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: rgba(33, 150, 243, 0.05);
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.notification-body {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.75rem;
  color: #888;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .mark-read-btn {
  opacity: 1;
}
</style>