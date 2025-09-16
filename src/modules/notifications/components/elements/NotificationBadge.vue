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
        class="button-counter flex flex-center"
      >
        <span>{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </div>
    </button>
    
    <Popup
      title="Notifications"
      @close-popup="closeNotifications"
      :isPopupOpen="isOpen"
      align="center right"
      class="bg-white h-min-100 w-100 w-max-30r pd-medium"
    >
      <div class="cols-1 gap-thin o-y-scroll">
        <div v-if="loading" class="notifications-loading">
          Loading...
        </div>
        
        <div v-else-if="notifications.length === 0" class="notifications-empty">
          No notifications
        </div>
        
        <div v-else class="flex-column flex gap-thin">
          <notification-item 
            v-for="notification in recentNotifications" 
            :key="notification._id" 
            :notification="notification"
            @click="handleNotificationClick(notification)"
          />

          <div class="flex-nowrap flex gap-thin">
            <button 
              v-if="unreadCount > 0"
              class="w-100 bg-second t-white radius-small  button" 
              @click="markAllAsRead"
            >
              Mark all read
            </button>

            <router-link class="w-100 bg-black t-white radius-small button" to="/notifications" @click="closeNotifications">
              View all 
            </router-link>
          </div>

        </div>

      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';

import Popup from '@martyrs/src/components/Popup/Popup.vue';

import NotificationItem from '../blocks/NotificationItem.vue';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import IconBell from '@martyrs/src/modules/icons/entities/IconBell.vue';

const props = defineProps({
  maxNotifications: {
    type: Number,
    default: 10
  },
  fill: {
    type: String,
    default: 'rgb(var(--white))'
  }
});

// Get router and notification functionality
const router = useRouter();

// Check if notifications module is loaded
const useNotifications = inject('useNotifications');

// Provide fallback values if module is not loaded
const { notifications, unreadCount, loading, markAllAsRead, getNotifications } = useNotifications ? useNotifications() : {
  notifications: ref([]),
  unreadCount: ref(0),
  loading: ref(false),
  markAllAsRead: () => {},
  getNotifications: () => {}
};

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

const closeNotifications = () => {
  isOpen.value = false;
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

// Lifecycle hooks
onMounted(() => {
  // Load notifications when component mounts
  const userId = auth.state.user._id;
  if (userId) {
    getNotifications(userId);
  }
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


.notifications-loading,
.notifications-empty {
  padding: 24px;
  text-align: center;
  color: rgb(var(--text-light));
}
</style>