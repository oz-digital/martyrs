import { toRefs, watch } from 'vue';
// Router import
import routerNotifications from './router/notifications.router.js';
// Store
import * as storeNotifications from './store/notifications.store.js';
// Auth store import
// Global WebSocket import
import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';
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

    // Отправь подписку на сервер
    await store.notifications.actions.registerDevice({
      deviceToken: JSON.stringify(subscription),
      deviceType: 'web',
    });
  }

  async initialize() {
    if (this.initialized || this.isServer) return;

    const userId = this.store.auth.state.user?._id;
    if (!userId) {
      console.warn('Cannot initialize notifications: No user ID found in auth store');
      return;
    }

    
    console.log('Connecting to websockets via notifications');
    globalWebSocket.initialize({
      wsUrl:   app.config.globalProperties.WSS_URL,
      maxReconnectAttempts: 10,
      reconnectDelay: 2000,
    });

    await globalWebSocket.connect(userId);

    globalWebSocket.removeModuleListeners('notification');

    await globalWebSocket.subscribeModule('notification');

    globalWebSocket.addEventListener(
      'notification',
      data => {
        this.store.notifications.actions.addLocalNotification(data.data);
      },
      { module: 'notification' }
    );

    // 🎯 Опционально включаем push
    if (this.options.enablePush !== false) {
      await this.pushHandler.requestPermissions();
      await this.registerWebPush(this.store);
    }

    this.initialized = true;

    // ✅ Загружаем список уведомлений из API
    await this.store.notifications.actions.getNotifications(userId);
  }

  disconnect() {
    if (this.isServer) return;

    globalWebSocket.removeModuleListeners('notification');
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
      const userId = store.auth.state.user?._id;
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
  const route = options.route || 'User Profile Root';
  router.addRoute(route, routerNotifications);
  store.addStore('notifications', storeNotifications);

  // Initialize global WebSocket if needed
  if (options.wsUrl) {
    globalWebSocket.initialize({ wsUrl:   app.config.globalProperties.WSS_URL });
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
    // Initialize after auth is confirmed
    const isAuthenticated = store.auth.state.access.status;
    const userId = store.auth.state.user?._id;

    if (isAuthenticated && userId) {
      notificationManager.initialize();
    }

    // Watch for user login/logout using auth store
    watch(
      () => store.auth.state.access.status,
      isAuthenticated => {
        if (isAuthenticated) {
          notificationManager.initialize();
        } else {
          notificationManager.disconnect();
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
      routerNotifications,
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

export default ModuleNotifications;
