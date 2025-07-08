// Dependencies
import { computed, reactive, watch } from 'vue';
// Setup Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// Auth
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

// Initial state for a notification
const notificationInitState = {
  _id: null,
  title: '',
  body: '',
  type: 'info',
  metadata: {},
  userId: null,
  status: 'pending',
  createdAt: null,
  updatedAt: null,
};

// Initial state for notification preferences
const preferencesInitState = {
  web: true,
  push: true,
  email: true,
  sms: true,
  telegram: false,
  whatsapp: false,
};

// State declaration
const state = reactive({
  notifications: [],
  unreadCount: 0,
  current: { ...notificationInitState },
  preferences: { ...preferencesInitState },
  deviceRegistered: false,
  loading: false,
  lastSync: null,
});

const actions = {
  /**
   * Get user notifications from server
   */
  async getNotifications(userId = null) {
    try {
      // Use provided userId or get from auth store
      const userIdToUse = userId || auth.state.user._id;

      if (!userIdToUse) {
        console.warn('Cannot get notifications: No user ID found');
        return [];
      }

      state.loading = true;
      const response = await $axios.get(`/api/notifications/user/${userIdToUse}`);
      state.notifications = response.data;
      state.lastSync = new Date().toISOString();
      updateUnreadCount();
      state.loading = false;
      return response.data;
    } catch (error) {
      state.loading = false;
      setError(error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await $axios.put(`/api/notifications/${notificationId}/read`);

      // Update the notification in the local state
      const index = state.notifications.findIndex(n => n._id === notificationId);
      if (index !== -1) {
        state.notifications[index] = response.data;
        updateUnreadCount();
      }

      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  /**
   * Synchronize notification status without API call
   * (For use with WebSocket updates)
   */
  syncNotificationStatus(notificationId, status) {
    const index = state.notifications.findIndex(n => n._id === notificationId);
    if (index !== -1) {
      state.notifications[index].status = status;
      state.notifications[index].updatedAt = new Date().toISOString();
      updateUnreadCount();
    }
  },

  /**
   * Register a device for push notifications
   */
  async registerDevice(deviceData) {
    try {
      // Add the current user ID to the device data
      const userId = auth.state.user._id;
      if (!userId) {
        console.warn('Cannot register device: No user ID found');
        return;
      }

      deviceData.userId = userId;

      const response = await $axios.post('/api/notifications/devices/register', deviceData);
      state.deviceRegistered = true;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    try {
      const userId = auth.state.user._id;
      if (!userId) {
        console.warn('Cannot update preferences: No user ID found');
        return;
      }

      // Transform preferences object to array format expected by the API
      const preferencesArray = Object.entries(preferences).map(([channelType, isEnabled]) => {
        return {
          channelType,
          notificationType: 'all', // Default type, can be made more specific
          isEnabled,
        };
      });

      const response = await $axios.put('/api/notifications/preferences', {
        userId,
        preferences: preferencesArray,
      });

      // Update state with new preferences
      const newPreferences = {};
      response.data.forEach(pref => {
        newPreferences[pref.channelType] = pref.isEnabled;
      });

      state.preferences = { ...preferencesInitState, ...newPreferences };
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   */
  async getPreferences() {
    try {
      const userId = auth.state.user._id;
      if (!userId) {
        console.warn('Cannot get preferences: No user ID found');
        return;
      }

      // Assuming an endpoint exists to fetch preferences
      const response = await $axios.get(`/api/notifications/preferences/${userId}`);

      // Transform API response to our state format
      const newPreferences = {};
      response.data.forEach(pref => {
        newPreferences[pref.channelType] = pref.isEnabled;
      });

      state.preferences = { ...preferencesInitState, ...newPreferences };
      return response.data;
    } catch (error) {
      setError(error);
      // If API fails, use default preferences
      state.preferences = { ...preferencesInitState };
      throw error;
    }
  },

  /**
   * Add a local notification (for handling push notifications or WebSocket notifications)
   */
  addLocalNotification(notification) {
    // Check if notification already exists by ID to prevent duplicates
    if (notification._id) {
      const existingIndex = state.notifications.findIndex(n => n._id === notification._id);
      if (existingIndex !== -1) {
        // Update existing notification
        state.notifications[existingIndex] = {
          ...state.notifications[existingIndex],
          ...notification,
          updatedAt: new Date().toISOString(),
        };
        updateUnreadCount();
        return;
      }
    }

    // Create a notification object that matches our expected format
    const newNotification = {
      _id: notification._id || Date.now().toString(), // Use provided ID or generate temporary one
      title: notification.title,
      body: notification.body,
      type: notification.type || notification.data?.type || 'info',
      metadata: notification.data || notification.metadata || {},
      status: notification.status || 'unread',
      createdAt: notification.createdAt || new Date().toISOString(),
      updatedAt: notification.updatedAt || new Date().toISOString(),
    };

    // Add to local state
    state.notifications.unshift(newNotification);
    updateUnreadCount();
  },

  /**
   * Handle notification action (e.g., when user taps on push notification)
   */
  handleNotificationAction(data) {
    // Mark notification as read if ID is provided
    if (data.notificationId) {
      actions.markAsRead(data.notificationId);
    }

    return true

    // // Navigate based on notification type and metadata
    // if (data.route) {
    //   // router.push(data.route);
    //   alert('1');
    // } else if (data.type === 'order') {
    //   // router.push(`/orders/${data.orderId}`);
    //   alert('2');
    // } else if (data.type === 'message') {
    //   // router.push('/messages');
    //   alert('3');
    // } else {
    //   // Default to notifications page
    //   // router.push('/notifications');
    //   alert('4');
    // }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const userId = auth.state.user._id;
      if (!userId) {
        console.warn('Cannot mark all as read: No user ID found');
        return;
      }

      console.log('=== markAllAsRead API call ===');
      console.log('URL:', `/api/notifications/user/${userId}/read-all`);
      
      const response = await $axios.put(`/api/notifications/user/${userId}/read-all`);
      
      console.log('markAllAsRead response status:', response.status);
      console.log('markAllAsRead response data:', response.data);

      // Update all notifications in local state
      state.notifications.forEach(notification => {
        notification.status = 'read';
        notification.updatedAt = new Date().toISOString();
      });

      updateUnreadCount();
      console.log('Local state updated, unread count:', state.unreadCount);
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },
};

const mutations = {
  resetNotifications() {
    state.notifications = [];
    state.unreadCount = 0;
    state.lastSync = null;
  },

  resetCurrent() {
    state.current = { ...notificationInitState };
  },

  resetPreferences() {
    state.preferences = { ...preferencesInitState };
  },
};

// Helper functions
function updateUnreadCount() {
  state.unreadCount = state.notifications.filter(n => n.status !== 'read').length;
}

// Track state changes
const history = [];
history.push(state);

watch(state, newState => {
  history.push(newState);
});

// Computed properties
const getters = {
  unreadNotifications: computed(() => {
    return state.notifications.filter(n => n.status !== 'read');
  }),

  readNotifications: computed(() => {
    return state.notifications.filter(n => n.status === 'read');
  }),

  notificationsByType: computed(() => {
    const result = {};
    state.notifications.forEach(notification => {
      if (!result[notification.type]) {
        result[notification.type] = [];
      }
      result[notification.type].push(notification);
    });
    return result;
  }),
};

export { actions, getters, mutations, state };
