<template>
  <div 
    v-if="prop.content" 
    class="o-hidden radius-big pos-relative bg-light w-100 flex-center flex"
  >
    <img loading="lazy" 
      :src="(FILE_SERVER_URL || '') + prop.content" 
      alt="Event image" 
      class="pos-relative z-index-1 d-block mn-auto w-100 h-100 object-fit-contain"
      style="max-height: 40rem"
    />

    <img loading="lazy" 
      :src="(FILE_SERVER_URL || '') + prop.content" 
      alt="Event Background" 
      class="z-index-0 pos-absolute w-100 h-100 pos-t-0 pos-r-0"
      style="
        transform: scale(1.5);
        filter: blur(2rem);
        -webkit-filter: blur(2rem);"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps([
  'label',
  'value',
  'prop'
]);
</script>
