<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

// Compute if notification is unread
const isUnread = computed(() => props.notification.status !== 'read');

// Format date
const formattedDate = computed(() => {
  const date = new Date(props.notification.createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
});

// Get icon based on notification type
const notificationIcon = computed(() => {
  switch (props.notification.type) {
    case 'alert':
      return '⚠️';
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'info':
    default:
      return 'ℹ️';
  }
});

// Emit click event
const emit = defineEmits(['click']);
const handleClick = () => {
  emit('click', props.notification);
};
</script>

<template>
  <div 
    class="notification-item" 
    :class="{ unread: isUnread }"
    @click="handleClick"
  >
    <div class="notification-icon">
      {{ notificationIcon }}
    </div>
    <div class="notification-content">
      <h3 class="notification-title">{{ notification.title }}</h3>
      <p class="notification-body">{{ notification.body }}</p>
      <span class="notification-time">{{ formattedDate }}</span>
    </div>
    <div v-if="isUnread" class="unread-indicator"></div>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 1rem;
  font-size: 1.5rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 1rem;
}

.notification-body {
  margin: 0 0 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #999;
}

.unread-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color, #0066cc);
  align-self: center;
  margin-left: 0.5rem;
}
</style>