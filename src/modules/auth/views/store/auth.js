// Dependencies
import $axios, { setAuthToken } from '@martyrs/src/modules/core/views/utils/axios-instance.js';
import Cookies from 'js-cookie';
// Capacitor
import { Preferences } from '@capacitor/preferences';
// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { useSession, setError } from '@martyrs/src/modules/core/views/store/core.store.js';
import wsManager from '@martyrs/src/modules/core/views/classes/ws.manager.js';
// State
import * as twofa from './twofa.js';

// State
const state = reactive({
  user: {
    _id: undefined,
    avatar: null,
    username: '',
    email: '',
    phone: '',
    password: '',
    passwordRepeat: '',
  },
  access: {
    roles: null,
    token: null,
    status: false,
  },
  accesses: [],
});

// Session manager
const session = useSession();

const actions = {
  async initialize(cookie) {
    try {
      const userCookie = cookie ? cookie : await getCookie('user');

      if (userCookie) {
        const { _id, email, phone, avatar, roles, accessToken } = userCookie;

        setAuthToken(accessToken);

        // Проверка токена через серверный маршрут
        const response = await $axios.get('/api/organizations/check-accesses');
        const userAccesses = response.data;

        // ТОЛЬКО ПОСЛЕ УСПЕШНОЙ ПРОВЕРКИ устанавливаем состояние
        state.accesses = userAccesses;
        Object.assign(state.user, { _id, email, phone, avatar });
        Object.assign(state.access, { token: accessToken, roles, status: !!accessToken });

        // Update Session with full user data
        session.set({ ...userCookie, accesses: userAccesses });

        // Переподключаем WebSocket если пользователь аутентифицирован
        if (_id && accessToken) {
          console.log('[AUTH] Reconnecting WebSocket for authenticated user:', _id);
          await wsManager.reconnectWithAuth(_id);
        }
      } else {
        console.log('no cookies');
        setAuthToken(null);
        session.clear();
        this.resetState();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Make sure we remove the cookie when there's an error
      await removeCookie('user');
      setAuthToken(null);
      session.clear();
      this.resetState();
      setError(error);
    }
  },

  // Helper method to reset state
  resetState() {
    state.accesses = [];
    state.user = {
      _id: undefined,
      avatar: null,
      username: '',
      email: '',
      phone: '',
      password: '',
      passwordRepeat: '',
    };
    state.access = {
      roles: null,
      token: null,
      status: false,
    };
    session.clear();
  },

  async login(user, type) {
    try {
      const response = await $axios.post('/api/auth/signin', {
        ...user,
        type,
      });

      setCookie('user', response.data);

      Object.assign(state.user, {
        ...response.data,
      });

      Object.assign(state.access, {
        token: response.data.accessToken,
        status: true,
        roles: response.data.roles,
      });

      session.set(response.data);

      await this.initialize();

      return response.data;
    } catch (error) {
      // Make sure cookie is removed on login error
      await removeCookie('user');

      Object.assign(state.access, {
        token: null,
        status: false,
        roles: null,
      });

      session.clear();

      console.log(error);
      setError(error);
      return Promise.reject(error);
    }
  },

  async signup(user, type, invite) {
    const { password, passwordRepeat } = state.user;

    console.log(password);
    console.log(passwordRepeat);

    if (password !== passwordRepeat) {
      const error = {
        response: {
          data: { errorCode: 'PASSWORDS_DO_NOT_MATCH' },
        },
      };
      setError(error);
      throw new Error(error.response.status);
    }

    try {
      const response = await $axios.post('/api/auth/signup', {
        ...user,
        type,
        inviteCode: invite,
      });

      console.log(response);

      if (response.data.accessToken) {
        setCookie('user', response.data);
      }

      Object.assign(state.user, {
        ...response.data,
      });

      Object.assign(state.access, {
        token: response.data.accessToken,
        status: true,
        roles: response.data.roles,
      });

      session.set(response.data);

      await this.initialize();

      return response.data;
    } catch (error) {
      // Make sure cookie is removed on signup error
      await removeCookie('user');
      setError(error);
      console.log('Sign up failed');
      throw error;
    }
  },

  async logout() {
    await removeCookie('user');
    setAuthToken(null);
    session.clear();
    this.resetState();

    // Отключаем WebSocket при выходе
    console.log('[AUTH] Disconnecting WebSocket on logout');
    wsManager.disconnect();
  },

  async resetPassword(user, type) {
    try {
      const response = await $axios.post('/api/auth/reset-password', {
        email: user.email,
        phone: user.phone,
        type,
      });

      Object.assign(twofa.state.code, {
        ...response.data,
        isSended: true,
      });

      return response.data;
    } catch (error) {
      setError(error);
      return Promise.reject(error);
    }
  },

  async updatePassword(user, type) {
    const { password, passwordRepeat } = state.user;

    if (password !== passwordRepeat) {
      const error = {
        response: {
          data: { errorCode: 'PASSWORDS_DO_NOT_MATCH' },
        },
      };
      setError(error);
      throw new Error(error.response.status);
    }

    try {
      const response = await $axios.post('/api/auth/update-password', {
        email: user.email,
        phone: user.phone,
        password: user.password,
        passwordRepeat: user.passwordRepeat,
        type,
      });

      if (response.data.accessToken) {
        setCookie('user', response.data);
      }

      Object.assign(state.user, {
        ...response.data,
      });

      Object.assign(state.access, {
        token: response.data.accessToken,
        status: true,
      });

      session.set(response.data);

      return response.data;
    } catch (error) {
      // Make sure cookie is removed on password update error
      await removeCookie('user');
      setError(error);
      return Promise.reject(error);
    }
  },
};

// Cookies
const optionsDefault = {
  development: { path: '/', domain: process.env.DOMAIN_URL, secure: false, expires: 7, sameSite: 'Lax' },
  production: {
    expires: 7,
    path: '/',
    domain: process.env.DOMAIN_URL,
    sameSite: 'strict',
    secure: true,
  },
};

async function getCookie(name) {
  if (process.env.MOBILE_APP) {
    const { value } = await Preferences.get({ key: name });
    return value ? JSON.parse(value) : null;
  } else {
    const cookie = Cookies.get(name);
    return cookie ? JSON.parse(cookie) : null;
  }
}

async function setCookie(name, data, mode = process.env.NODE_ENV) {
  if (process.env.MOBILE_APP) {
    // Если приложение запущено в Capacitor
    await Preferences.set({
      key: name,
      value: JSON.stringify(data),
    });
  } else {
    // Для веб-версии
    const options = optionsDefault[mode];
    console.log('[AUTH COOKIE DEBUG] setCookie', { name, mode, options, domain: process.env.DOMAIN_URL });
    Cookies.set(name, JSON.stringify(data), options);
  }
}

async function removeCookie(name, mode = process.env.NODE_ENV) {
  if (process.env.MOBILE_APP) {
    // Если приложение запущено в Capacitor
    await Preferences.remove({ key: name });
  } else {
    // Для веб-версии
    const options = optionsDefault[mode];
    const allCookiesBefore = typeof document !== 'undefined' ? document.cookie : 'SSR - no document';
    console.log('[AUTH COOKIE DEBUG] removeCookie BEFORE', { name, mode, options, domain: process.env.DOMAIN_URL, allCookies: allCookiesBefore });
    Cookies.remove(name, options);
    const allCookiesAfter = typeof document !== 'undefined' ? document.cookie : 'SSR - no document';
    console.log('[AUTH COOKIE DEBUG] removeCookie AFTER', { allCookies: allCookiesAfter });
  }
}

// History
const history = [];
history.push(state);

// Watch
watch(state, (newState, oldState) => {
  history.push(newState);
});

// Module Export
export { actions, removeCookie, state };
