// Vue modules
import { Preferences } from '@capacitor/preferences';
import { reactive } from 'vue';

// import i18n from "@/localization.js";

// State
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
  }
});

// Actions
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
      invertColors(variableNames, state.theme.originalColors);
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

// Mutations
function setError(error) {
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

function setSnack(data) {
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

function invertColors(variableNames, originalColors) {
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
    document.documentElement.style.setProperty(variableName, state.theme.darkmode ? invertedColor.join(', ') : baseColor);
  });
}

export { actions, setError, setSnack, state };
