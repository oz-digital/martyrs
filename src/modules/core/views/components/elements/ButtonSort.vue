<template>
  <div 
    @click="handleClick"
    class="
      cursor-pointer
      t-center
      t-black
      radius-small 
      flex-center
      flex
      aspect-1x1
    "
  >
    <IconSort
      :order="order"
      class="w-100 h-auto"
    />
  </div>
</template>

<script setup>
import { toRefs } from 'vue';

import IconSort from '@martyrs/src/modules/icons/navigation/IconSort.vue'

const props = defineProps({
  action: {
    type: Function,
  },
  order: {
    type: String,
    required: true
  }
});

const { action, order } = toRefs(props);

const handleClick = () => {
  if (action.value) action.value();
};
</script>
