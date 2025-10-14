<template>
  <a
    v-if="supportUrl"
    :href="supportUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="help-card pd-small mn-small radius-small bg-light cursor-pointer"
  >
    <div class="help-icon mn-b-thin" style="font-size: 2rem;">💬</div>
    <div class="help-title t-medium mn-b-micro">Need help?</div>
    <div class="help-subtitle t-small t-transp">24/7 online support</div>
  </a>
</template>

<script setup>
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
import { computed } from 'vue';

const store = useStore()

defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

const supportUrl = computed(() => store.core.state.config?.app?.support?.url);
</script>

<style scoped>
.help-card {
  margin-top: auto;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: opacity 0.2s ease;
}

.help-card:hover {
  opacity: 0.8;
}
</style>
