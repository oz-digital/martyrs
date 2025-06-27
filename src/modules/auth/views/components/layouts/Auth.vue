<template>
  <div 
  	class="cols-2-1_2 gap-small pd-small"
  >

    <router-view
    	class="pd-big mobile:pd-medium w-m-66r t-center" 
    	v-slot="{ Component, route }"
    >
      <transition 
      	name="scaleIn" mode="out-in"
      >
        <component 
        	ref="page" 
        	:key="route.path" 
        	:localPosition="localPosition" 
        	:is="Component" 
        />
      </transition>
    </router-view>

    <section class="w-100 desktop-only o-hidden radius-big bg-grad-main">
      <SliderFeatures/>  
    </section>
  </div>
</template>

<script setup>
// Import components
import Tab from '@martyrs/src/components/Tab/Tab.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
// Import blocks
import SliderFeatures from '@martyrs/src/modules/auth/views/components/sections/SliderFeatures.vue'
// Import libs
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Import state
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
// Import validation
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'

const phoneValidation = ref(null)
const passswordValidation = ref(null)
const emailValidation = ref(null)
// Accessing router
const route = useRoute()
const router = useRouter()
// Accessing state
const tabAuth = ref('email')
// Methods
async function onSubmit() {
  try {
    await inputsValidation.validateInputs(
      emailValidation,
      inputsValidation.validateEmail,
      auth.state.user.email,
      'Некорректный email'
    )
    await inputsValidation.validateInputs(
      passswordValidation,
      inputsValidation.validatePassword,
      auth.state.user.password,
      'Некорректный пароль'
    )
  } catch (error) {
    throw new Error
  }
  await auth.actions.login(auth.state.user, tabAuth.value)
}

function redirectTo() {
  router.push({ name: 'Account' })
}
</script>