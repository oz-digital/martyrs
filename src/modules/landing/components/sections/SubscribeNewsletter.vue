<template>
  <div class="pos-relative z-index-1">
    <header class="d-inline-block z-index-1 mn-b-big">
      <h2 class="mn-b-semi">{{ t('title') }}</h2>
      <p class="t-transp p-semi">{{ t('subtitle') }}</p>
    </header>

    <FieldSubscribeNewsletter
      :placeholder="te('placeholder') ? t('placeholder') : null"
      :action="te('action') ? t('action') : null"
      :successTitle="te('success.title') ? t('success.title') : null"
      :successSubtitle="te('success.subtitle') ? t('success.subtitle') : null"
      :socials="te('socials') ? tm('socials') : null"
      fieldName="newsletter-subscribe"
      fieldId="newsletter-subscribe-main"
      class="d-inline-flex bg-white t-black w-100 w-max-40r"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import FieldSubscribeNewsletter from '@martyrs/src/modules/orders/components/elements/FieldSubscribeNewsletter.vue'

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

// Локализация
const { t, tm, te } = useI18n({
  messages: props.content
})
</script>

<style lang="scss" >
</style>
