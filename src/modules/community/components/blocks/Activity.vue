<template>
  <section class="w-100 cols-4 t-left flex-nowrap flex">
    <div v-if="likes" class="w-100 br-2px br-solid br-white-transp-10 radius-small pd-small flex-v-center flex-nowrap flex">
      <p class="h4 i-medium mn-r-small">👍</p>
      <span class="t-semi uppercase">{{ likes }}<br>likes</span>
    </div>
    <div v-if="comments" class="w-100 br-2px br-solid br-white-transp-10 radius-small pd-small flex-v-center flex-nowrap flex">
      <p class="h4 i-medium mn-r-small">💬</p>
      <span class="t-semi uppercase">{{ comments }}<br>comments</span>
    </div>
    <div v-if="subscriptions" class="w-100 br-2px br-solid br-white-transp-10 radius-small pd-small flex-v-center flex-nowrap flex">
       <p class="h4 i-medium mn-r-small">👍</p>
      <span class="t-semi uppercase">{{ subscriptions }}<br>subscriptions</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  likes: Number,
  comments: Number,
  subscriptions: Number
});
</script>
