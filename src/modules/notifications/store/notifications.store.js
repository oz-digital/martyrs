// Dependencies
import { computed, reactive, watch } from 'vue';
// Setup Axios
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
// Auth
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
// Capacitor Preferences
import { Preferences } from '@capacitor/preferences';

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
      const userId = auth.state.user?._id;
      
      if (userId) {
        // Registered user
        deviceData.userId = userId;
      } else {
        // Anonymous user - generate or use existing anonymousId
        if (!deviceData.anonymousId) {
          // Generate anonymous ID if not provided
          deviceData.anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          // Store in Capacitor Preferences for persistence
          if (typeof window !== 'undefined') {
            try {
              await Preferences.set({
                key: 'notifications_anonymous_id',
                value: deviceData.anonymousId
              });
            } catch (error) {
              console.warn('Could not save anonymous ID to preferences:', error);
            }
          }
        }
      }

      console.log('[Notifications Store] Registering device:', deviceData);
      const response = await $axios.post('/api/notifications/devices/register', deviceData);
      console.log('[Notifications Store] Device registered successfully:', response.data);
      state.deviceRegistered = true;
      return response.data;
    } catch (error) {
      setError(error);
      throw error;
    }
  },

  /**
   * Re-register device after user login
   */
  async reregisterDeviceAfterLogin() {
    try {
      const deviceIdResult = await Preferences.get({ key: 'notifications_device_id' });
      const deviceTokenResult = await Preferences.get({ key: 'notifications_device_token' });
      const deviceTypeResult = await Preferences.get({ key: 'notifications_device_type' });
      
      const deviceId = deviceIdResult.value;
      const deviceToken = deviceTokenResult.value;
      const deviceType = deviceTypeResult.value || 'web';
      
      if (deviceId && deviceToken) {
        console.log('[Notifications Store] Re-registering device after login:', { deviceId, deviceType });
        await this.registerDevice({
          deviceId,
          deviceToken,
          deviceType
        });
      } else {
        console.log('[Notifications Store] No stored device info for re-registration');
      }
    } catch (error) {
      console.error('Error re-registering device after login:', error);
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
