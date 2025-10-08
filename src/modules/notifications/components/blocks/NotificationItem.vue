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
    class="notification-item gap-thin flex pd-small radius-small bg-light" 
    :class="{ 'bg-second-small': isUnread }"
    @click="handleClick"
  >
    <div class="notification-icon">
      {{ notificationIcon }}
    </div>
    <div class="notification-content">
      <p class="p-regular t-medium mn-b-small">{{ notification.title }}</p>
      <p class="p-small mn-b-small">{{ notification.body }}</p>
      <p class="pd-thin w-max radius-thin bg-white">{{ formattedDate }}</p>
    </div>
    <div v-if="isUnread" class="flex-child-default unread-indicator"></div>
  </div>
</template>

<style scoped>
.unread-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color, #0066cc);
  align-self: center;
  margin-left: 0.5rem;
}
</style>