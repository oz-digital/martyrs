export const createEventBus = () => {
  const events = new Map();

  return {
    emit(eventName, data) {
      if (!eventName) throw new Error('Event name is required');

      const listeners = events.get(eventName);
      if (!listeners) return;

      // Execute callbacks in try-catch to prevent chain breaking
      listeners.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    },

    on(eventName, callback) {
      if (!eventName) throw new Error('Event name is required');
      if (typeof callback !== 'function') throw new Error('Callback must be a function');

      if (!events.has(eventName)) {
        events.set(eventName, new Set());
      }
      events.get(eventName).add(callback);

      return () => this.off(eventName, callback);
    },

    off(eventName, callback) {
      if (!eventName) throw new Error('Event name is required');

      if (callback) {
        events.get(eventName)?.delete(callback);
      } else {
        events.delete(eventName);
      }
    },

    // Clear all events and listeners
    destroy() {
      events.clear();
    },
  };
};
