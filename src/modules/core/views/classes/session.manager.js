class SessionManager {
  constructor(sessionState) {
    this.sessionState = sessionState;
    this.listeners = [];
  }

  get state() {
    return this.sessionState;
  }

  set(userData) {
    this.sessionState.token = userData.accessToken;
    this.sessionState.userId = userData._id;
    this.sessionState.roles = userData.roles;
    this.sessionState.accesses = userData.accesses || [];
    this.emit('change', this.sessionState);
  }

  clear() {
    this.sessionState.token = null;
    this.sessionState.userId = null;
    this.sessionState.roles = null;
    this.sessionState.accesses = [];
    this.emit('change', this.sessionState);
  }

  hydrate(cookie) {
    if (cookie) {
      this.sessionState.token = cookie.accessToken;
      this.sessionState.userId = cookie._id;
      this.sessionState.roles = cookie.roles;
      this.sessionState.accesses = cookie.accesses || [];
    }
  }

  isAuthenticated() {
    return !!this.sessionState.token;
  }

  getAccesses() {
    return this.sessionState.accesses;
  }

  getUserId() {
    return this.sessionState.userId;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  emit(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }
}

export default SessionManager;
