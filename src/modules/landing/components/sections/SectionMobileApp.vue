<template>
  <section id="mobileApp" class="cols-2 o-hidden ">
      <picture>
        <source 
          type="image/webp"
          :srcset="`${FILE_SERVER_URL || ''}/landing/mockup-400w.webp 400w,
                   ${FILE_SERVER_URL || ''}/landing/mockup-800w.webp 800w,
                   ${FILE_SERVER_URL || ''}/landing/mockup-1200w.webp 1200w,
                   ${FILE_SERVER_URL || ''}/landing/mockup.webp 2028w`"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        >
        <img 
          loading="lazy" 
          :src="(FILE_SERVER_URL || '') + t('image')" 
          :srcset="`${FILE_SERVER_URL || ''}/landing/mockup.jpg 2028w`"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          class="radius-medium w-100 h-100 mobile:h-auto object-fit-cover"
          alt="OZ DAO Mobile App"
        >
      </picture>

    <div class="pd-big flex flex-h-center flex-column z-index-1 w-1/2">
      <h2 class="mn-t-medium mn-b-semi w-m-40r">{{ t('title') }}</h2>
      <p class="t-transp mn-b-big p-semi w-m-33r">{{ t('description') }}</p>
      
      <div class="mn-b-big gap-medium cols-2">
        <div v-for="feature in tm('features')"  class="feature">
          <h4 class="mn-b-small">{{ feature.title }}</h4>
          <p class="t-transp p-medium">{{ feature.text }}</p>
        </div>
      </div>

      <div class="w-100 w-max-30r flex-nowrap flex gap-medium">
        <a 
           v-if="te('linkAppStore') || te('label')"
          :href="te('linkAppStore') ? t('linkAppStore') : null" 
          :target="te('linkAppStore') ? '_blank' : null" 
          class="pos-relative w-100 h-100"
        > 
          <span 
            v-if="te('label')"
            class="z-index-2 radius-medium bg-main t-semi uppercase pd-thin pos-absolute pos-r-10-negative pos-t-10-negative"
          >
            {{ t('label') }}
          </span>
          <LabelAppStore class="w-100 h-max" alt="Download on App Store"/>
        </a>

        <a 
           v-if="te('linkGooglePlay') || te('label')"
          :href="te('linkGooglePlay') ? t('linkGooglePlay') : null" 
          :target="te('linkGooglePlay') ? '_blank' : null" 
          class="pos-relative w-100 h-100"
        > 
          <span 
            v-if="te('label')"
            class="z-index-2 pd-thin radius-medium bg-main t-semi uppercase pos-absolute pos-r-10-negative pos-t-10-negative"
          >
            {{ t('label') }}
          </span>
          <LabelGooglePlay class="w-100 h-max" alt="Download on Google Play"/>
        </a>

      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import LabelAppStore from '@martyrs/src/modules/icons/labels/LabelAppStore.vue'
import LabelGooglePlay from '@martyrs/src/modules/icons/labels/LabelGooglePlay.vue'

const props = defineProps({
    content: {
      type: Object,
      required: true
    }
  })

  const { t, tm, te } = useI18n({
    messages: props.content
  })
</script>

<style lang="scss">
 @media screen and (max-width: 1025px) {
  #mobileApp {
    text-align: center;
    > section {
      flex-direction: column;
      > div {
        order: 1;
      }
    }
  }
}
</style>
