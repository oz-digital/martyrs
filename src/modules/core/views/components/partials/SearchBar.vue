<template>
  <BlockSearch
    :collapsible="isMobile"
    class="mn-r-big mn-l-big"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'
import BlockSearch from '@martyrs/src/modules/core/views/components/blocks/BlockSearch.vue'

const { t, te } = useI18n({ messages: {
  "en": {
    "navigation": {
      "home": "Home",
      "catalog": "Catalog",
      "rents": "My Rents",
      "community": "Community",
      "profile": "Profile"
    }
  }
}})

const isMobile = ref(false)

// For SSR environment, we need to check client-side only
if (typeof window !== 'undefined') {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches
}
</script>