<template>
  <div class="select-country">
    <p class="h1">🌍</p>
    <br>
    <h3 class="mn-b-semi">{{t('title')}}</h3>
    <!-- Select city -->
    <div class="mn-b-semi">
      <!-- Description -->
      <p class="mn-b-small t-transp p-regular">{{t('description')}}</p> 
      <!-- Input -->
      <div class="flex-nowrap flex mn-b-small pd-small radius-small bg-light">
        <span class="d-block mn-r-auto">{{t('cities[0]')}}</span>
        <a @click="closePopup()">{{t('choose')}}</a>
      </div>
    </div>
    <!-- Coming soon cities -->
    <p class="mn-b-small">{{t('comingsoon')}}</p>
    
    <div class="cols-4 gap-small mn-b-semi">
      <!-- Input -->
      <div class="flex-nowrap flex pd-small radius-small bg-light">
        <span class="d-block">{{t('cscities[0]')}}</span>
      </div>
      <div class="flex-nowrap flex pd-small radius-small bg-light">
        <span class="d-block">{{t('cscities[1]')}}</span>
      </div>
      <div class="flex-nowrap flex pd-small radius-small bg-light">
        <span class="d-block">{{t('cscities[2]')}}</span>
      </div>
      <div class="flex-nowrap flex pd-small radius-small bg-light">
        <span class="d-block">{{t('cscities[3]')}}</span>
      </div>
    </div>
    <!-- Description -->
    <p class="mn-b-small t-transp">{{t('helpus')}}</p> 
    <div class="pd-small p-medium radius-small bg-light">
      <a class="">hello@nms.network</a>
    </div>
  </div>
</template>
<script setup>
// Import libs
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Define props
const props = defineProps({
  isPopupOpen: {
    type: Boolean,
    default: false
  },
});
const emits = defineEmits(['close-popup'])
function closePopup() {
  emits("close-popup");
} 
// Accessing router and store
const route = useRoute()
const router = useRouter()
// Localization
const text = {
  messages: {
    en: {
      title: "Choose Your City",
      description: "Please select your city from the list below to see rental options and other relevant information:",
      choose: "Current",
      cities: [
        "Phuket"
      ],
      comingsoon: "Coming soon:",
      cscities: [
        "Bangkok",
        "Chiang Mai",
        "Pha-ngan",
        "Pattaya",
      ],
      helpus: "NMS is your ultimate entertainment and lifestyle guide. Want to partner with us or share ideas? Reach out at:",
      cultivate: "Let's create unforgettable moments together! 🎵🌴"
    },
  }
}
const { t } = useI18n(text)
</script>
<style lang="scss">
  .select-country {
    max-width: 100%;
  }
</style>