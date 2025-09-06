// Polyfills for browser compatibility

// requestIdleCallback polyfill для Safari
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = function(callback, options) {
    const start = Date.now();
    return setTimeout(function() {
      callback({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, options?.timeout || 1);
  };
}

if (typeof window !== 'undefined' && !window.cancelIdleCallback) {
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

// Export for documentation purposes
export const polyfills = {
  requestIdleCallback: true,
  cancelIdleCallback: true
};