<!-- @martyrs/src/modules/auth/views/components/AuthDialog.vue -->
<template>
  <Popup 
    :isPopupOpen="authState.visible" 
    @close-popup="closeAuth"
    class="bg-white radius-medium pd-medium"
  >
    <div class="t-center">
      <img loading="lazy" :src="'/logo/logo.svg'" class="i-extra radius-small mn-b-medium">
      <h3 class="mn-b-medium">{{ authState.title || 'Welcome' }}</h3>
      <p class="mn-b-semi t-transp">{{ authState.subtitle || 'Please sign in or create an account to continue.' }}</p>
      
      <div class="flex-column flex gap-thin">
        <Button 
          :submit="handleSignUp" 
          class="bg-main radius-small mn-b-small pd-thin"
        >
          Sign Up
        </Button>
        
        <span>
          Already have an account? 
          <a @click="handleSignIn" class="t-second cursor-pointer">Sign in</a>
        </span>
      </div>
    </div>
  </Popup>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Button from '@martyrs/src/components/Button/Button.vue';

const props = defineProps({
  authState: {
    type: Object,
    required: true
  },
  closeAuth: {
    type: Function,
    required: true
  }
});

const router = useRouter();
const route = useRoute();

const handleSignIn = async () => {
  const returnUrl = props.authState.returnUrl || route.fullPath;
  await router.push({ 
    name: 'Sign In',
    query: { returnUrl }
  });
  props.closeAuth('signin');
};

const handleSignUp = async () => {
  const returnUrl = props.authState.returnUrl || route.fullPath;
  await router.push({ 
    name: 'Sign Up',
    query: { returnUrl }
  });
  props.closeAuth('signup');
};
</script>