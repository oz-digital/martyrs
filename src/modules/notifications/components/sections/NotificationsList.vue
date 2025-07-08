<template>
  <div class="notifications-list-container">
    <div v-if="!MOBILE_APP" class="notifications-header">
      <h2>Notifications</h2>
   <!--    <div class="notifications-controls">
        <div class="notifications-filter">
          <label for="filter-type">Filter: </label>
          <select id="filter-type" v-model="filterType">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <button 
          v-if="unreadCount > 0" 
          class="mark-all-read-btn"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div> -->
    </div>
    
    <div v-if="loading" class="notifications-loading">
      <div class="loading-spinner">🔄</div>
      <p>Loading notifications...</p>
    </div>
    
    <div v-else-if="filteredNotifications.length === 0" class="notifications-empty">
      <p>{{ emptyMessage }}</p>
    </div>
    
    <div v-else class="notifications-items">
      <notification-item 
        v-for="notification in filteredNotifications" 
        :key="notification._id" 
        :notification="notification"
        @click="handleNotificationClick(notification)"
      />
    </div>
    
    <div v-if="!loading && notifications.length > 0" class="notifications-footer">
      <button v-if="lastSync" class="refresh-btn" @click="refreshNotifications">
        🔄 Last updated: {{ formatTime(lastSync) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import NotificationItem from '../blocks/NotificationItem.vue';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

// Get router and notification functionality
const router = useRouter();
const { 
  notifications, 
  unreadCount, 
  loading, 
  lastSync,
  markAllAsRead, 
  getNotifications,
  handleNotificationAction
} = inject('useNotifications')();

// Local state
const filterType = ref('all');

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value];
  
  // Apply filters
  if (filterType.value === 'unread') {
    filtered = filtered.filter(n => n.status !== 'read');
  } else if (filterType.value === 'read') {
    filtered = filtered.filter(n => n.status === 'read');
  } else if (filterType.value !== 'all') {
    // Filter by notification type
    filtered = filtered.filter(n => n.type === filterType.value);
  }
  
  // Sort by creation date (newest first)
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const emptyMessage = computed(() => {
  if (notifications.value.length === 0) {
    return 'You have no notifications';
  }
  
  switch (filterType.value) {
    case 'unread':
      return 'You have no unread notifications';
    case 'read':
      return 'You have no read notifications';
    default:
      return `You have no ${filterType.value} notifications`;
  }
});

// Methods
const handleNotificationClick = (notification) => {
  if (notification._id) {
    handleNotificationAction({
      notificationId: notification._id,
      ...notification.metadata
    });
  }
};

const refreshNotifications = () => {
  const userId = auth.state.user._id;
  if (userId) {
    getNotifications(userId);
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
  } else {
    // Format date string
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Lifecycle
onMounted(() => {
  const userId = auth.state.user._id;
  if (userId && notifications.value.length === 0 && !loading.value) {
    getNotifications(userId);
  }
});
</script>

<style scoped>
.notifications-list-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notifications-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notifications-filter select {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.mark-all-read-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.notifications-loading,
.notifications-empty {
  padding: 40px 0;
  text-align: center;
  color: #666;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.notifications-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notifications-footer {
  margin-top: 20px;
  text-align: center;
}

.refresh-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 6px 12px;
}

.refresh-btn:hover {
  color: #2196f3;
}
</style>