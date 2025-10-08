<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  actionText: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['action']);

const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div class="flex flex-column flex-align-center flex-justify-center pd-y-extra pd-x-medium">
    <div class="bg-light radius-round pd-semi mn-b-medium">
      <slot name="icon"></slot>
    </div>
    <h3 class="h3 t-medium mn-b-thin">{{ title }}</h3>
    <p class="p-regular t-grey t-center w-max-40r mn-b-semi">{{ message }}</p>
    <button
      v-if="actionText"
      @click="handleAction"
      class="bg-main hover-bg-main-semi t-white pd-small pd-x-semi radius-medium t-medium transition-cubic-in-out cursor-pointer"
    >
      {{ actionText }}
    </button>
  </div>
</template>
