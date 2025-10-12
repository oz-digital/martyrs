// import i18n from "@martyrs/src/modules/core/views/localization/vue-i18n.js";
const messages = {
  ru: {
    validation: {
      length: 'Содержимое должно быть не менее 1 символа.',
      maxLength: 'Содержимое не должно превышать {maxLength} символов.',
      phone: 'Неверный формат номера',
      email: 'Неверный формат email',
      password: {
        minLength: 'Пароль должен быть больше 8 символов',
        lowercase: 'Должен быть символ в нижнем регистре',
        uppercase: 'Должен быть символ в верхнем регистре',
        number: 'Должна быть 1 цифра',
        specialChar: 'Должен быть 1 специальный символ',
      },
    },
  },
  en: {
    validation: {
      length: 'Content must be at least 1 character long.',
      maxLength: 'Content should not exceed {maxLength} characters.',
      phone: 'Invalid number format',
      email: 'Invalid email format',
      password: {
        minLength: 'Password must be longer than 8 characters',
        lowercase: 'Must contain a lowercase character',
        uppercase: 'Must contain an uppercase character',
        number: 'Must contain at least 1 digit',
        specialChar: 'Must contain at least 1 special character',
      },
    },
  },
};

// i18n.global.mergeLocaleMessage('ru', messages.ru);
// i18n.global.mergeLocaleMessage('en', messages.en);

function validateLength(input) {
  const length = input.length;

  if (length < 1) {
    return {
      status: false,
      // message:  i18n.global.t("validation.length")
      message: 'validation.length',
    };
  }

  return {
    status: true,
    message: null,
  };
}

function validatePhone(phone) {
  return {
    status: true,
    message: null,
  };
}

function validateEmail(email) {
  // const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,12}$/; Not allowing to add +1, +2, +3 and etc after email
  const emailRegex = /^[\w-]+(\.[\w-]+)*(\+[\w-]+)?@([\w-]+\.)+[\w-]{2,12}$/;

  if (!emailRegex.test(email)) {
    return {
      status: false,
      // message:  i18n.global.t("validation.email")
      message: 'validation.email',
    };
  }

  return {
    status: true,
    message: null,
  };
}

function validatePassword(password) {
  const lowercaseRegex = /[a-z]/;
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[@$!%*?&]/;

  if (password.length < 8) {
    return {
      status: false,
      // message:  i18n.global.t("validation.password.minLength")
      message: 'validation.password.minLength',
    };
  }

  // if (!lowercaseRegex.test(password)) {
  //    return {
  //     status: false,
  //     message:i18n.global.t("validation.password.lowercase")
  //   }
  // }

  // if (!uppercaseRegex.test(password)) {
  //   return {
  //     status: false,
  //     message: i18n.global.t("validation.password.uppercase")
  //   }
  // }

  // if (!numberRegex.test(password)) {
  //   return {
  //     status: false,
  //     message: i18n.global.t("validation.password.number")
  //   }
  // }

  // if (!specialCharRegex.test(password)) {
  //   return {
  //     status: false,
  //     message: i18n.global.t("validation.password.specialChar")
  //   }
  // }

  return {
    status: true,
    message: null,
  };
}

async function validateInputs(input, method, variable, message) {
  if (!variable) {
    input.value = {
      status: false,
      // message: i18n.global.t("validation.length")
      message: 'validation.length',
    };

    setTimeout(() => {
      input.value = null;
    }, 3000);
    // throw new Error(i18n.global.t("validation.length"));
    throw new Error('validation.length');
  } else {
    const InputGood = method(variable);

    if (!InputGood.status) {
      input.value = InputGood;
      setTimeout(() => {
        input.value = null;
      }, 3000);
      throw new Error(message);
    }
  }
}

export { validateEmail, validateInputs, validateLength, validatePassword, validatePhone };
