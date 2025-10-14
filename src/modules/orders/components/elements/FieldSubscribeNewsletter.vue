<template>
  <FieldBig 
    :input="email" 
    :typingSpeed="typingSpeed"
    :loopTyping="loopTyping"
    :enableTyping="enableTyping"
    :placeholder="props.placeholder || t('orders.newsletter.placeholder')"
    :action="props.action === false ? '' : props.action || t('orders.newsletter.action')"
    :name="fieldName"
    :id="fieldId"
    @update:input="email = $event"
    @action="sendApplication"
    :showLoader="true"
    :showSuccess="false"
    :callbackDelay="100"
    v-bind="$attrs"
  >
    <Popup
      :isPopupOpen="isSuccessPopupOpen"
      @close-popup="isSuccessPopupOpen = false"
      align="center center"
      class="bg-white t-black pd-big radius-big"
    >
      <div class="t-center">
        <h3 class="mn-b-medium">{{ props.successTitle || t('orders.newsletter.success.title') }}</h3>
        <p class="t-transp mn-b-medium">{{ props.successSubtitle || t('orders.newsletter.success.subtitle') }}</p>
        
        <div v-if="(props.socials || tm('orders.newsletter.socials')) && (props.socials || tm('orders.newsletter.socials')).length" class="flex flex-wrap flex-h-center gap-regular">
          <a
            v-for="social in (props.socials || tm('orders.newsletter.socials'))"
            :key="social.name"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover-scale-1 bg-light radius-small pd-thin transition-all"
          >
            <component
              :is="socialIcons[social.icon]"
              class="i-medium"
              :fill="'rgb(var(--dark))'"
            />
          </a>
        </div>
      </div>
    </Popup>
  </FieldBig>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FieldBig from '@martyrs/src/components/FieldBig/FieldBig.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue'

import IconFacebook from '@martyrs/src/modules/icons/socials/facebook.vue'
import IconInstagram from '@martyrs/src/modules/icons/socials/instagram.vue'
import IconTelegram from '@martyrs/src/modules/icons/socials/telegram.vue'
import IconTwitter from '@martyrs/src/modules/icons/socials/twitter.vue'
import IconYoutube from '@martyrs/src/modules/icons/socials/youtube.vue'
import IconLinkedin from '@martyrs/src/modules/icons/socials/linkedin.vue'
import IconWhatsapp from '@martyrs/src/modules/icons/socials/whatsapp.vue'

import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
import applications from '@martyrs/src/modules/orders/store/applications.js'

const store = useStore()

const props = defineProps({
  // Тексты компонента
  title: {
    type: String,
    default: null
  },
  subtitle: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  action: {
    type: String,
    default: null
  },
  successTitle: {
    type: String,
    default: null
  },
  successSubtitle: {
    type: String,
    default: null
  },
  socials: {
    type: Array,
    default: null
  },
  // Настройки поля
  typingSpeed: {
    type: Number,
    default: 75
  },
  loopTyping: {
    type: Boolean,
    default: false
  },
  enableTyping: {
    type: Boolean,
    default: false
  },
  fieldName: {
    type: String,
    default: 'newsletter-email'
  },
  fieldId: {
    type: String,
    default: null
  }
})

// Используем только глобальную локализацию
const { t, tm } = useI18n({
  useScope: 'global'
})

let email = ref('')
let isSuccessPopupOpen = ref(false)

const socialIcons = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  telegram: IconTelegram,
  twitter: IconTwitter,
  youtube: IconYoutube,
  linkedin: IconLinkedin,
  whatsapp: IconWhatsapp
}

// Функция валидации email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showSuccessPopup() {
  isSuccessPopupOpen.value = true
}

async function sendApplication() {
  // Валидация email перед отправкой
  if (!email.value || !email.value.trim()) {
    store.core.setError({ message: t('validation.email.required') || 'Email is required' })
    return Promise.reject(new Error('Email is required'))
  }

  if (!validateEmail(email.value.trim())) {
    store.core.setError({ message: t('validation.email.invalid') || 'Invalid email format' })
    return Promise.reject(new Error('Invalid email format'))
  }

  gtag('event', 'subscribe_newsletter', {
    'event_category': 'conversion',
    'event_label': 'Subscribe Newsletter'
  });

  try {
    let application = {
      type: 'newsletter',
      contacts: {
        email: email.value.trim()
      }
    };

    // Используем публичный API для создания заявки
    const response = await fetch(`${process.env.API_URL}/api/applications/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application)
    });

    if (!response.ok) {
      throw new Error('Failed to create application');
    }

    const result = await response.json();

    showSuccessPopup()
    return Promise.resolve(result);
  } catch (error) {
    console.log(error)
    store.core.setError(error)
    return Promise.reject(error);
  }
}
</script>

<style lang="scss">
</style>