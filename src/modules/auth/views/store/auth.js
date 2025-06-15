// Dependencies
import $axios, { setAuthToken } from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
import Cookies from 'js-cookie';
// Capacitor
import { Preferences } from '@capacitor/preferences';
// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/globals/views/store/globals.js';
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

const actions = {
  async initialize(cookie) {
    try {
      const userCookie = cookie ? cookie : await getCookie('user');

      if (userCookie) {
        const { _id, email, phone, avatar, roles, accessToken } = userCookie;

        setAuthToken(accessToken);

        // Проверка токена через серверный маршрут
        const response = await $axios.get('/api/auth/check-accesses');
        const userAccesses = response.data;
        state.accesses = userAccesses;

        // Обновление состояния приложения с информацией о пользователе и его правах доступа
        Object.assign(state.user, { _id, email, phone, avatar });
        Object.assign(state.access, { token: accessToken, roles, status: !!accessToken });
      } else {
        console.log('no cookies');
        setAuthToken(null);
        this.resetState();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Make sure we remove the cookie when there's an error
      await removeCookie('user');
      setAuthToken(null);
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
    this.resetState();
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
  development: { secure: false, expires: 7, sameSite: 'Lax' },
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

async function setCookie(name, data, env = process.env.DOMAIN_URL) {
  if (process.env.MOBILE_APP) {
    // Если приложение запущено в Capacitor
    await Preferences.set({
      key: name,
      value: JSON.stringify(data),
    });
  } else {
    // Для веб-версии
    Cookies.set(name, JSON.stringify(data), optionsDefault[env]);
  }
}

async function removeCookie(name, env = process.env.NODE_ENV) {
  if (process.env.MOBILE_APP) {
    // Если приложение запущено в Capacitor
    await Preferences.remove({ key: name });
  } else {
    // Для веб-версии
    const options = env === 'production' ? { domain: process.env.DOMAIN_URL, path: '/' } : {};
    Cookies.remove(name, options);
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
