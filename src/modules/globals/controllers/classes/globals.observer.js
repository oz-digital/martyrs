class Observer {
  constructor() {
    this.listeners = {};
  }
  subscribe(eventType, callback, once = false) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = new Map();
    }
    this.listeners[eventType].set(callback, { once });
  }
  async notify(eventType, data) {
    if (this.listeners[eventType]) {
      const promises = [];
      const callbacksToRemove = [];
      // Create a list of promises for all callbacks
      for (const [callback, { once }] of this.listeners[eventType]) {
        const promise = Promise.resolve()
          .then(() => callback(data))
          .catch(error => {
            console.error('Error executing callback:', error);
          });
        promises.push(promise);
        if (once) {
          callbacksToRemove.push(callback);
        }
      }
      // Wait for all promises to settle
      await Promise.all(promises);
      // Remove callbacks that are set to run only once
      for (const callback of callbacksToRemove) {
        this.listeners[eventType].delete(callback);
        if (this.listeners[eventType].size === 0) {
          delete this.listeners[eventType];
        }
      }
    }
  }
  remove(eventType, callback) {
    if (this.listeners[eventType]?.has(callback)) {
      this.listeners[eventType].delete(callback);
      if (this.listeners[eventType].size === 0) {
        delete this.listeners[eventType];
      }
    }
  }
}
export default Observer;
