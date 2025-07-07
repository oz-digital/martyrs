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
    let root = document.querySelector(':root');

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
      // Сохраняем оригинальные цвета
      state.theme.originalColors = {};
      variableNames.forEach(variableName => {
        const currentColor = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        state.theme.originalColors[variableName] = currentColor;
      });
    }

    if (isDarkMode) {
      invertColors(variableNames, state.theme.originalColors);
    } else {
      // Восстанавливаем оригинальные цвета
      variableNames.forEach(variableName => {
        document.documentElement.style.setProperty(variableName, state.theme.originalColors[variableName]);
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

  if (error?.response?.data) errorData = error.response.data;

  if (error && errorData.errorCode) {
    // state.error.message = i18n.global.t(`errors.${errorData.errorCode}`);
    state.error.message = errorData.errorCode;
  } else {
    state.error.message = errorData.message || 'Unknown error';
  }

  state.error.show = true;

  setTimeout(() => (state.error.show = false), 3000);
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
  setTimeout(() => {
    state.snack.show = false
  }, duration)
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
