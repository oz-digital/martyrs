<template>
  <div class="flex flex-v-center gap-thin">
    <IconCalendar class="i-small" />
    <span class="t-medium">{{ dateText }}</span>
  </div>
</template>

<script setup>
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue'

defineProps({
  dateText: {
    type: String,
    required: true
  }
})
</script>