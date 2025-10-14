// Vue modules
import { Preferences } from '@capacitor/preferences';
import { isReactive, reactive } from 'vue';

import SessionManager from '../classes/session.manager.js';

// AsyncLocalStorage для изоляции SSR store per-request (только Node.js)
let asyncLocalStorage = null;

if (typeof window === 'undefined') {
  // Top-level await для динамического импорта на сервере
  const { AsyncLocalStorage } = await import('async_hooks');
  asyncLocalStorage = new AsyncLocalStorage();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function invertColors(variableNames, originalColors, isDarkMode) {
  variableNames.forEach(variableName => {
    const baseColor = originalColors[variableName];
    const colorArray = baseColor.split(',').map(Number);

    let invertedColor;

    if (variableName === '--white') {
      invertedColor = colorArray.map(value => 255 - value / 1.075);
    } else if (variableName === '--black') {
      invertedColor = colorArray.map(value => 255 - value);
    } else if (variableName === '--grey') {
      invertedColor = colorArray.map(value => 255 - value * 2);
    } else {
      invertedColor = colorArray.map(value => 255 - value / 1.075);
    }
    // Устанавливаем новые значения переменных CSS
    document.documentElement.style.setProperty(variableName, isDarkMode ? invertedColor.join(', ') : baseColor);
  });
}

// ============================================================================
// GLOBAL FUNCTIONS (используют useStore() для доступа к state)
// ============================================================================

// Mutations
export function setError(error) {
  const state = useStore().core.state;
  state.error.show = true;
  let errorData;

  errorData = error;

  // Обработка ошибок из fetch API (Store class)
  if (error?.info) errorData = error.info;

  // Обработка ошибок из axios
  if (error?.response?.data) errorData = error.response.data;

  // Обработка ошибок верификации
  if ((errorData?.error === 'VALIDATION_ERROR' || errorData?.errors) && errorData?.errors) {
    // Собираем все сообщения об ошибках в одну строку
    const errorMessages = [];
    for (const field in errorData.errors) {
      const fieldErrors = errorData.errors[field];
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(...fieldErrors);
      } else if (typeof fieldErrors === 'string') {
        errorMessages.push(fieldErrors);
      }
    }
    state.error.message = errorMessages.join(', ') || errorData.message || 'Validation error';
  } else if (error && errorData.errorCode) {
    // state.error.message = i18n.global.t(`errors.${errorData.errorCode}`);
    state.error.message = errorData.errorCode;
  } else {
    state.error.message = errorData.message || error.message || 'Unknown error';
  }

  state.error.show = true;

  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    requestAnimationFrame(() => {
      setTimeout(() => (state.error.show = false), 5000);
    });
  } else {
    setTimeout(() => (state.error.show = false), 5000);
  }
}

export function setSnack(data) {
  const state = useStore().core.state;

  // Handle different input formats
  let type = 'notification'
  let message = ''
  let duration = 3000

  if (typeof data === 'string') {
    message = data
  } else if (data instanceof Error) {
    type = 'error'
    message = data.message
  } else if (data?.response?.data) {
    // Handle API errors
    type = 'error'
    const errorData = data.response.data
    message = errorData.errorCode || errorData.message || 'Unknown error'
  } else if (typeof data === 'object') {
    type = data.type || 'notification'
    message = data.message || ''
    duration = data.duration || 3000
  }

  // Update state
  state.snack = {
    show: true,
    type,
    message,
    duration
  }

  // Auto-hide
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    requestAnimationFrame(() => {
      setTimeout(() => {state.snack.show = false }, duration)
    });
  } else {
    setTimeout(() => {state.snack.show = false }, duration)
  }
}

// ============================================================================
// GLOBAL STORE FACTORY
// ============================================================================

// Фабрика для создания store
export function createStore() {
  // State создается для каждого store instance (изоляция SSR)
  const state = reactive({
    loading: false,

    isOpenLocationPopup: false,
    isOpenSidebar: false,

    position: null,
    search: null,

    theme: {
      darkmode: false,
    },

    navigation_bar: {
      name: null,
      actions: null,
    },

    error: {
      status: '',
      headers: '',
      data: '',
      show: false,
      name: '',
      message: '',
    },
    snack: {
      show: false,
      type: 'notification',
      message: '',
      duration: 3000
    },

    // Session state - данные сессии хранятся здесь
    session: {
      token: null,
      userId: null,
      roles: null,
      accesses: []
    },
  });

  // Actions с closure на локальный state
  const actions = {
    setLoading(status) {
      state.loading = status;
    },

    // Black/White Theme
    async setTheme(isDarkMode) {
      // Cache root element
      if (!state.theme.rootElement) {
        state.theme.rootElement = document.documentElement;
      }
      const root = state.theme.rootElement;

      state.theme.darkmode = isDarkMode;

      await Preferences.set({
        key: 'darkmode',
        value: JSON.stringify(state.theme.darkmode),
      });

      if (isDarkMode) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }

      const variableNames = ['--white', '--light', '--grey', '--dark', '--black'];

      // Проверяем, сохранены ли оригинальные цвета
      if (!state.theme.originalColors) {
        // Сохраняем оригинальные цвета один раз
        state.theme.originalColors = {};
        const computedStyle = getComputedStyle(root);
        variableNames.forEach(variableName => {
          state.theme.originalColors[variableName] = computedStyle.getPropertyValue(variableName).trim();
        });
      }

      if (isDarkMode) {
        invertColors(variableNames, state.theme.originalColors, isDarkMode);
      } else {
        // Восстанавливаем оригинальные цвета батчем
        variableNames.forEach(variableName => {
          root.style.setProperty(variableName, state.theme.originalColors[variableName]);
        });
      }
    },

    toggleTheme() {
      this.setTheme(!state.theme.darkmode);
    },

    add(array, item) {
      const existingItemIndex = array.findIndex(i => i._id === item._id);

      if (existingItemIndex === -1) {
        array.push(item);
      } else {
        array[existingItemIndex] = item;
      }
    },

    update(array, item) {
      const existingItemIndex = array.findIndex(i => i._id === item._id);
      if (existingItemIndex === -1) {
        // If the item doesn't exist, push it to the array
        array.push(item);
      } else {
        // Update the item in the array without creating a new array
        Object.assign(array[existingItemIndex], item);
      }
    },

    delete(array, item) {
      const existingItemIndex = array.findIndex(c => c._id === item._id);

      if (existingItemIndex !== -1) {
        array.splice(existingItemIndex, 1);
      }
    },

    increment(array, item) {
      console.log(array);
      console.log(item);
      const arrayItem = array.find(i => i._id === item._id);

      if (arrayItem) {
        arrayItem.quantity++;
      }
    },

    decrement(array, item) {
      const arrayItem = array.find(i => i._id === item._id);

      const arrayItemIndex = array.indexOf(arrayItem);

      if (arrayItemIndex > -1) {
        arrayItem.quantity--;

        if (arrayItem.quantity < 1) array.splice(arrayItemIndex, 1);
      }
    },

    reset(array) {
      array = [];
    },
  };

  // SessionManager создается внутри createStore для правильной изоляции в SSR
  const sessionManager = new SessionManager(state.session);

  const store = reactive({
    modules: [],

    // Core module registered by default
    core: { state, actions, session: sessionManager },

    addStore(name, storage) {
      this[name] = storage;
      this.modules.push(name);
    },

    async getInitialState() {
      const initialState = {};
      for (const [moduleName, moduleStore] of Object.entries(this)) {
        if (moduleName !== 'modules' && moduleName !== 'addStore' && moduleName !== 'getInitialState' && moduleName !== 'setInitialState') {
          if (moduleStore.state) {
            initialState[moduleName] = JSON.parse(JSON.stringify(moduleStore.state));
          }
        }
      }
      return initialState;
    },

    async setInitialState(initialState, isHydration = false) {
      const modules = Object.entries(initialState);

      for (const [moduleName, moduleState] of modules) {
        if (this[moduleName] && this[moduleName].state) {
          // При гидратации просто заменяем state целиком для скорости
          if (isHydration) {
            Object.assign(this[moduleName].state, moduleState);
          } else {
            mergeReactive(this[moduleName].state, moduleState);
          }
        }
      }
    }
  });

  function mergeReactive(target, source) {
    // Оптимизированная версия слияния
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const sourceValue = source[key];

      if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (isReactive(target[key])) {
          mergeReactive(target[key], sourceValue);
        } else {
          target[key] = sourceValue;
        }
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return store;
}

// ============================================================================
// SSR AND SINGLETON
// ============================================================================

// Синглтон для клиента
let clientStore = null;

// AsyncLocalStorage для SSR (изоляция per-request)
export function setSSRStore(store) {
  if (typeof window === 'undefined') {
    asyncLocalStorage.enterWith(store);
  }
}

export function clearSSRStore() {
  if (typeof window === 'undefined') {
    asyncLocalStorage.enterWith(null);
  }
}

export function useStore() {
  if (typeof window === 'undefined') {
    // SSR: используем store из AsyncLocalStorage
    const store = asyncLocalStorage.getStore();
    if (store) {
      return store;
    }
    // Fallback для обратной совместимости
    console.warn('[WARN] SSR store not in AsyncLocalStorage, creating new store instance');
    return createStore();
  }
  // Client: синглтон
  if (!clientStore) {
    clientStore = createStore();
  }
  return clientStore;
}

// ============================================================================
// SESSION ACCESSOR
// ============================================================================

/**
 * Получить текущий экземпляр SessionManager
 * Использовать вместо прямого импорта session для правильной работы с SSR
 */
export function useSession() {
  const store = useStore();
  return store.core.session;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Не экспортируем singleton state/actions - теперь используется useStore()
export default useStore();
