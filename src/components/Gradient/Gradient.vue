<template>
  <div :style="{ background: gradient }">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  colors: {
    type: Array,
    default: () => ['#000', '#fff']
  },
  
  type: {
    type: String,
    default: 'linear',
    validator: v => ['linear', 'radial', 'conic'].includes(v)
  },
  
  angle: {
    type: [Number, String],
    default: 180
  },
  
  position: {
    type: String,
    default: 'center'
  },
  
  shape: {
    type: String,
    default: 'circle'
  },
  
  size: {
    type: String,
    default: 'farthest-corner'
  },
  
  repeating: {
    type: Boolean,
    default: false
  }
})

const normalizedColors = computed(() => {
  return props.colors.map((item, index) => {
    if (typeof item === 'string') {
      const stop = props.colors.length > 1 
        ? (index / (props.colors.length - 1)) * 100 
        : 0
      return { color: item, stop }
    }
    return {
      color: item.color || '#000',
      stop: item.stop ?? (index / Math.max(props.colors.length - 1, 1)) * 100
    }
  })
})

const colorStops = computed(() => {
  return normalizedColors.value
    .map(({ color, stop }) => `${color} ${stop}%`)
    .join(', ')
})

const gradient = computed(() => {
  const prefix = props.repeating ? 'repeating-' : ''
  
  switch (props.type) {
    case 'linear':
      const direction = typeof props.angle === 'string' 
        ? props.angle 
        : `${props.angle}deg`
      return `${prefix}linear-gradient(${direction}, ${colorStops.value})`
      
    case 'radial':
      return `${prefix}radial-gradient(${props.shape} ${props.size} at ${props.position}, ${colorStops.value})`
      
    case 'conic':
      return `${prefix}conic-gradient(from ${props.angle}deg at ${props.position}, ${colorStops.value})`
  }
})
</script>