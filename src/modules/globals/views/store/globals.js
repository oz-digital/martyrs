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

const errorMessages = {
  ru: {
    errors: {
      USER_ALREADY_REGISTERED: 'Такой пользователь уже зарегистрирован!',
      USER_NOT_REGISTERED_YET: 'Такой пользователь еще не зарегистрирован!',
      USER_PHONE_OR_PASSWORD_NOT_FOUND: 'Пользователь с таким телефоном или паролем не найден!',
      INCORRECT_PASSWORD_ENTERED: 'Вы ввели неверный пароль!',
      INVALID_INVITATION_CODE: 'Неверный код приглашения',
      MISSING_REQUIRED_PARAMETERS: 'Отсутствуют необходимые параметры.',
      ERROR_UPDATING_USER: 'Произошла ошибка при обновлении пользователя.',
      PASSWORDS_DO_NOT_MATCH: 'Введенные вами пароли не совпадают. Исправьте ошибки и попробуйте еще раз.',
      CODE_NOT_SENT: 'Что-то пошло не так и код не был отправлен. Попробуйте еще раз.',
      INPUT_ERROR: 'Вставьте только четырехзначный код.',
      WRONG_CODE: 'Вы ввели неверный код. Попробуйте еще раз.',
      POST_URL_ALREADY_IN_USE: 'Ошибка! Публикация с этим URL уже используется!',
      NAME_CANNOT_BE_EMPTY: 'Ошибка: Название не может быть пустым. Пожалуйста, введите название.',
    },
  },
  en: {
    errors: {
      USER_ALREADY_REGISTERED: 'Such user is already registered!',
      USER_NOT_REGISTERED_YET: 'This user has not been registered yet!',
      USER_PHONE_OR_PASSWORD_NOT_FOUND: 'User with such phone or password not found!',
      INCORRECT_PASSWORD_ENTERED: 'You entered an incorrect password!',
      INVALID_INVITATION_CODE: 'Incorrect invitation code.',
      MISSING_REQUIRED_PARAMETERS: 'Missing required parameters.',
      ERROR_UPDATING_USER: 'Something wrong when updating user.',
      PASSWORDS_DO_NOT_MATCH: 'The passwords you entered do not match. Please correct the errors and try again.',
      CODE_NOT_SENT: 'Something went wrong and the code was not sent. Please try again.',
      INPUT_ERROR: 'Please enter only a four-digit code.',
      WRONG_CODE: 'You entered an incorrect code. Please try again.',
      POST_URL_ALREADY_IN_USE: 'Failed! Blogpost with this URL is already in use!',
      NAME_CANNOT_BE_EMPTY: 'Error: Name cannot be empty. Please enter a name.',
    },
  },
};

// i18n.global.mergeLocaleMessage('ru', errorMessages.ru);
// i18n.global.mergeLocaleMessage('en', errorMessages.en);

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

export { actions, setError, state };
