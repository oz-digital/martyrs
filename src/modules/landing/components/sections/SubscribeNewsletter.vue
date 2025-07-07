<template>
  <div class="pos-relative z-index-1">
    <header class="d-inline-block z-index-1 mn-b-big">
      <h2 class="mn-b-semi">{{ t('title') }}</h2>
      <p class="t-transp p-semi">{{ t('subtitle') }}</p>
    </header>

    <FieldBig 
      :input="email" 
      :typingSpeed="75"
      :loopTyping="false"
      :enableTyping="false"
      :placeholder="t('placeholder')"
      :action="t('action')"
      @update:input="email = $event"
      @action="sendApplication"
      class="d-inline-flex bg-white t-black w-100 w-max-40r"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import FieldBig from "@martyrs/src/components/FieldBig/FieldBig.vue";

import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as applications from '@martyrs/src/modules/orders/store/applications.js';

// import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
    })
  }
})

// Localization
const { t } = useI18n({
  messages: props.content
})

let email = ref('')
let emailValidation = ref(false)

async function sendApplication() {
  // try {
  //   await inputsValidation.validateInputs(
  //     emailValidation, 
  //     inputsValidation.validateEmail, 
  //     email.value, 
  //     'Wrong email'
  //   )
  // } catch (error) {
  //    globals.setError({
  //     response: {
  //       status: "Invalid Email", 
  //       data: {
  //         message: "The email address entered is invalid. Please provide a valid email address."
  //       }
  //     }
  //   });
  //   return false
  // }

  gtag('event', 'subscribe_newsletter', {
    'event_category': 'conversion',
    'event_label': 'Subscribe Newsletter'
  });

  try {
    let application = {
      type: 'newsletter',
      contacts: {
        email: email.value
      }
    };
    const response = await applications.create(application);

    return Promise.resolve(response.data);
  } catch (error) {
    console.log(error)
    globals.setError(error)
    return Promise.reject(error);
  }
}
</script>

<style lang="scss" >
</style>
