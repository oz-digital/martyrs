<template>
  <div 
    class="gantt-bar pos-absolute radius-small cursor-pointer shadow-small transition-ease-out hover-scale-0"
    :class="barClass"
    :style="barStyle"
    @click="$emit('click')"
  >
    <div class="pd-micro t-micro t-white t-truncate">
      {{ bar.item.title || bar.item.name || 'Task' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bar: { type: Object, required: true },
  view: { type: String, required: true }
})

const emit = defineEmits(['click'])

// Bar class based on status
const barClass = computed(() => {
  const statusMap = {
    active: 'bg-main',
    completed: 'bg-second',
    canceled: 'bg-red',
    default: 'bg-gray'
  }
  
  return statusMap[props.bar.status] || statusMap.default
})

// Bar style
const barStyle = computed(() => ({
  left: props.bar.left + 'px',
  width: props.bar.width + 'px',
  top: (10 + props.bar.row * 22) + 'px',
  height: '20px',
  zIndex: 10 - props.bar.row
}))
</script>

<style>
.gantt-bar {
  max-height: 20px;
  line-height: 20px;
}
</style>