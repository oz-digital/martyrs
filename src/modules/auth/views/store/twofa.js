// Vue modules
import { reactive, watch } from 'vue';
// Globals
import { setError } from '@martyrs/src/modules/core/views/store/core.store.js';
// Setup Axios
import $axios from '@martyrs/src/modules/core/views/utils/axios-instance.js';
// State
const state = reactive({
  code: {
    value: '',
    type: '',
    method: '',
    isSended: false,
    isValid: false,
  },
});

async function sendCode(user, method, type) {
  let api = '/api/twofa/sendcode';

  if (method === 'reset-password') api = '/api/twofa/sendcodereset';

  return await $axios
    .post(api, {
      phone: user.phone,
      email: user.email,
      method: method,
      type: type,
    })
    .then(
      response => {
        state.code = response.data;
        state.code.isSended = true;
        return Promise.resolve(response.data);
      },
      error => {
        console.log('error is', error);
        setError(error);
        return Promise.reject(error);
      }
    );
}

function validCode() {
  const rightcode = state.status.signup.code.value.code;
  const usercode = state.user.code;

  if (rightcode == usercode) {
    state.status.signup.code.isValid = true;
  } else {
    setError({
      response: {
        status: 'Неверный код',
        data: { message: 'Вы ввели неверный код. Попробуйте еще раз.' },
      },
    });
  }
}

// // History
const history = [];
history.push(state);

// // Watch
watch(state, (newState, oldState) => {
  history.push(newState);
});

// Module Export
export { sendCode, state };
