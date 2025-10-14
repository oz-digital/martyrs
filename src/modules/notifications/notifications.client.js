// [LOADING 37] Notifications module import started
performance.mark('loading-37-start');
console.log('[LOADING 37] Notifications module import started...');

import { toRefs, watch } from 'vue';
// Router import
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './notifications.router.js';
// Store
import * as storeNotifications from './store/notifications.store.js';
// Global WebSocket import
import wsManager from '@martyrs/src/modules/core/views/classes/ws.manager.js';
// Capacitor Preferences
import { Preferences } from '@capacitor/preferences';
// Layouts
import NotificationsLayout from './components/layouts/NotificationsLayout.vue';
// Sections
import NotificationPreferences from './components/sections/NotificationPreferences.vue';
import NotificationsList from './components/sections/NotificationsList.vue';
// Pages
import Notifications from './components/pages/Notifications.vue';
// Components
import NotificationItem from './components/blocks/NotificationItem.vue';
import NotificationBadge from './components/elements/NotificationBadge.vue';

performance.mark('loading-37-imports-end');
const importsTime = performance.measure('loading-37-imports', 'loading-37-start', 'loading-37-imports-end');
console.log(`[LOADING 37] All imports completed in ${importsTime.duration.toFixed(2)}ms`);

/**
 * Capacitor Push Notification handler
 */
class CapacitorPushHandler {
  constructor(store) {
    this.store = store;
    this.pushNotifications = null;
    this.device = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Capacitor plugins
   */
  async initialize() {
    // Skip if running in SSR
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Dynamic imports to prevent errors in web environment
      const { Capacitor } = await import('@capacitor/core');
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { Device } = await import('@capacitor/device');

      this.capacitor = Capacitor;
      this.pushNotifications = PushNotifications;
      this.device = Device;

      // Only proceed if running on a native platform
      if (!this.capacitor.isNativePlatform()) {
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error importing Capacitor plugins:', error);
      return false;
    }
  }

  /**
   * Request permission and register for push notifications
   */
  async requestPermissions() {
    // Skip if running in SSR
    if (typeof window === 'undefined') {
      return false;
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      // Request permission
      const permissionResult = await this.pushNotifications.requestPermissions();
      if (permissionResult.receive !== 'granted') {
        console.log('Push notification permission denied');
        return false;
      }

      // Set up event listeners
      this._setupListeners();

      // Register with Apple/Google
      await this.pushNotifications.register();
      return true;
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }

  /**
   * Setup push notification event listeners
   */
  _setupListeners() {
    // Registration event
    this.pushNotifications.addListener('registration', this._handleRegistration.bind(this));

    // Notification received event
    this.pushNotifications.addListener('pushNotificationReceived', this._handleNotificationReceived.bind(this));

    // Notification action performed event
    this.pushNotifications.addListener('pushNotificationActionPerformed', this._handleNotificationAction.bind(this));
  }

  /**
   * Handle registration token received
   */
  async _handleRegistration(token) {
    try {
      // Get device info
      const deviceInfo = await this.device.getInfo();
      const deviceId = await this.device.getId();

      // Prepare device data
      const deviceData = {
        deviceId: deviceId.uuid,
        deviceType: deviceInfo.platform.toLowerCase(),
        deviceToken: token.value,
      };

      // Store device info for re-registration after login
      try {
        await Preferences.set({
          key: 'notifications_device_id',
          value: deviceId.uuid
        });
        await Preferences.set({
          key: 'notifications_device_token',
          value: token.value
        });
        await Preferences.set({
          key: 'notifications_device_type',
          value: deviceInfo.platform.toLowerCase()
        });
      } catch (error) {
        console.warn('Could not save device info to preferences:', error);
      }

      // For anonymous users, add anonymousId
      if (!this.store.core.state.session.userId) {
        let anonymousId = null;
        try {
          const result = await Preferences.get({ key: 'notifications_anonymous_id' });
          anonymousId = result.value;
        } catch (error) {
          console.warn('Could not get anonymous ID from preferences:', error);
        }
        
        if (!anonymousId) {
          anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          try {
            await Preferences.set({
              key: 'notifications_anonymous_id',
              value: anonymousId
            });
          } catch (error) {
            console.warn('Could not save anonymous ID to preferences:', error);
          }
        }
        deviceData.anonymousId = anonymousId;
      }

      // Register device with backend
      await this.store.notifications.actions.registerDevice(deviceData);
    } catch (error) {
      console.error('Error handling push registration:', error);
    }
  }

  /**
   * Handle received notification
   */
  _handleNotificationReceived(notification) {
    // Add notification to store
    this.store.notifications.actions.addLocalNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    });
  }

  /**
   * Handle notification action (when user taps on notification)
   */
  _handleNotificationAction(actionData) {
    if (actionData.notification && actionData.notification.data) {
      this.store.notifications.actions.handleNotificationAction(actionData.notification.data);
    }
  }

  /**
   * Remove push notification listeners
   */
  removeListeners() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.pushNotifications) {
      this.pushNotifications.removeAllListeners();
    }
  }
}

/**
 * Notification Manager for coordinating WebSocket and Push notifications
 */

class NotificationManager {
  constructor(store, options = {}) {
    this.store = store;
    this.options = options;
    this.pushHandler = new CapacitorPushHandler(store);
    this.initialized = false;
    this.isServer = typeof window === 'undefined';
  }

  async registerWebPush(store) {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push не поддерживается в браузере');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Разрешение на уведомления не получено');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BJtNnRrx05VQS0abnkHC-8gHJWpnmoqC_iQveENCmZOZIs-adWzqAiqFCdGVVd7CbiaLW-Q5iuIBDRgM9G-VnKg',
    });

    console.log('New subscription:', JSON.stringify(subscription));

    const deviceToken = JSON.stringify(subscription);
    const deviceId = await this.generateDeviceId();
    
    // Store device data for re-registration after login
    try {
      await Preferences.set({
        key: 'notifications_device_id',
        value: deviceId
      });
      await Preferences.set({
        key: 'notifications_device_token',
        value: deviceToken
      });
      await Preferences.set({
        key: 'notifications_device_type',
        value: 'web'
      });
    } catch (error) {
      console.warn('Could not save device info to preferences:', error);
    }

    const deviceData = {
      deviceToken,
      deviceType: 'web',
      deviceId
    };

    // For anonymous users, get or generate anonymousId
    if (!store.core.state.session.userId) {
      let anonymousId = null;
      try {
        const result = await Preferences.get({ key: 'notifications_anonymous_id' });
        anonymousId = result.value;
      } catch (error) {
        console.warn('Could not get anonymous ID from preferences:', error);
      }
      
      if (!anonymousId) {
        anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        try {
          await Preferences.set({
            key: 'notifications_anonymous_id',
            value: anonymousId
          });
        } catch (error) {
          console.warn('Could not save anonymous ID to preferences:', error);
        }
      }
      deviceData.anonymousId = anonymousId;
    }

    // Register device
    console.log('[Notifications] Registering device with data:', deviceData);
    await store.notifications.actions.registerDevice(deviceData);
  }

  async generateDeviceId() {
    // Try to get or generate a persistent device ID
    try {
      const result = await Preferences.get({ key: 'notifications_device_id' });
      let deviceId = result.value;
      
      if (!deviceId) {
        deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await Preferences.set({
          key: 'notifications_device_id',
          value: deviceId
        });
      }
      return deviceId;
    } catch (error) {
      console.warn('Could not access preferences for device ID:', error);
      return 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
  }

  async initialize() {
    if (this.initialized || this.isServer) return;

    const userId = this.store.core.state.session.userId;
    
    // Connect WebSocket only for authenticated users
    if (userId) {
      console.log('Connecting to websockets via notifications');
      wsManager.initialize({
        wsUrl: process.env.WSS_URL,
        maxReconnectAttempts: 10,
        reconnectDelay: 2000,
      });

      await wsManager.connect(userId);

      wsManager.removeModuleListeners('notification');

      await wsManager.subscribeModule('notification');

      wsManager.addEventListener(
        'notification',
        data => {
          this.store.notifications.actions.addLocalNotification(data.data);
        },
        { module: 'notification' }
      );

      // Load notifications from API for authenticated users
      await this.store.notifications.actions.getNotifications(userId);
    } else {
      console.log('Initializing notifications for anonymous user');
    }

    // Enable push notifications for both authenticated and anonymous users
    // Skip auto-init for mobile apps - will be triggered manually from Walkthrough
    if (this.options.enablePush !== false && !process.env.MOBILE_APP) {
      await this.pushHandler.requestPermissions();
      await this.registerWebPush(this.store);
    }

    this.initialized = true;
  }

  disconnect() {
    if (this.isServer) return;

    wsManager.removeModuleListeners('notification');
    this.pushHandler.removeListeners();
    this.initialized = false;
  }
}

/**
 * Server-side utility for pre-fetching notification data
 */
const SSRUtils = {
  /**
   * Pre-fetch notifications for SSR
   * @param {Object} store - Store instance
   * @param {Object} context - SSR context
   */
  async prefetchNotifications(store, context) {
    try {
      const userId = store.core.state.session.userId;
      if (userId) {
        // Fetch notifications without WebSocket or push setup
        await store.notifications.actions.getNotifications(userId);
      }
    } catch (error) {
      console.error('Error pre-fetching notifications for SSR:', error);
    }
  },
};

/**
 * Function to initialize the notifications module
 * @param {Object} app - Vue app instance
 * @param {Object} store - Vuex/Pinia store
 * @param {Object} router - Vue Router instance
 * @param {Object} options - Configuration options
 */
function initializeNotifications(app, store, router, options = {}) {
  // Add routes and store
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('notifications', storeNotifications);

  // Initialize global WebSocket if needed
  if (options.wsUrl) {
    wsManager.initialize({ wsUrl: process.env.WSS_URL });
  }

  // Create notification manager
  const notificationManager = new NotificationManager(store, {
    enablePush: options.enablePush !== false,
    maxReconnectAttempts: options.maxReconnectAttempts || 5,
    reconnectDelay: options.reconnectDelay || 3000,
    pingInterval: options.pingInterval || 30000,
  });

  // Attach notification manager to store for access in components
  store.notificationManager = notificationManager;

  // Don't auto-initialize on server
  const isServer = typeof window === 'undefined';
  const autoInit = !isServer && options.autoInit !== false;

  if (autoInit) {
    // Initialize immediately (supports both authenticated and anonymous users)
    notificationManager.initialize();

    // Watch for user login/logout using store.core.state.session
    watch(
      () => store.core.state.session.token,
      async (token, oldToken) => {
        const isAuthenticated = !!token;
        const wasAuthenticated = !!oldToken;

        if (isAuthenticated && !wasAuthenticated) {
          // Re-register device for authenticated user
          console.log('[Notifications] User logged in, re-registering device...');
          await store.notifications.actions.reregisterDeviceAfterLogin();
          // Reinitialize notifications for authenticated user
          notificationManager.disconnect();
          await notificationManager.initialize();
        } else if (!isAuthenticated && wasAuthenticated) {
          // Keep notifications active for anonymous users, just reset user-specific data
          console.log('[Notifications] User logged out, resetting notifications...');
          store.notifications.mutations.resetNotifications();
        }
      }
    );
  }

  // Provide composable for components to access notification functionality
  app.provide('useNotifications', () => {
    return {
      ...toRefs(store.notifications.state),
      ...store.notifications.actions,
      ...store.notifications.mutations,
      init: notificationManager.initialize.bind(notificationManager),
      disconnect: notificationManager.disconnect.bind(notificationManager),
      isServer,
    };
  });

  return notificationManager;
}

// Module export
const ModuleNotifications = {
  initialize: initializeNotifications,
  SSR: SSRUtils, // Export SSR utilities
  views: {
    store: {
      storeNotifications,
    },
    router: {
      getRoutes,
    },
    components: {
      // Elements
      NotificationBadge,
      // Blocks
      NotificationItem,
      // Sections
      NotificationsList,
      NotificationPreferences,
      // Pages
      Notifications,
      // Layouts
      NotificationsLayout,
    },
  },
};

// Component exports
export {
  // Elements
  NotificationBadge,
  // Blocks
  NotificationItem,
  NotificationPreferences,
  // Pages
  Notifications,
  // Layouts
  NotificationsLayout,
  // Sections
  NotificationsList,
  // SSR Utilities
  SSRUtils,
};

// [LOADING 37] Notifications module import completed
performance.mark('loading-37-end');
performance.measure('loading-37-total', 'loading-37-start', 'loading-37-end');
const totalTime = performance.getEntriesByName('loading-37-total')[0];
console.log(`[LOADING 37] Notifications module fully imported in ${totalTime?.duration?.toFixed(2)}ms`);

export default ModuleNotifications;
