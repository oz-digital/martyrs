<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect y="0" :width="order === 'desc' ? 32 : 8" height="5" rx="2.5" :fill="fill"  class="transition-linear"/>
    <rect y="9" :width="order === 'desc' ? 24 : 16" height="5" rx="2.5" :fill="fill"  class="transition-linear"/>
    <rect y="18" :width="order === 'desc' ? 16 : 24" height="5" rx="2.5" :fill="fill"  class="transition-linear"/>
    <rect y="27" :width="order === 'desc' ? 8 : 32" height="5" rx="2.5" :fill="fill"  class="transition-linear"/>
  </svg>
</template>

<script setup>
  const props = defineProps({
    fill: {
      type: String,
      default: 'rgb(var(--black))'
    },
    order: {
      type: String,
      default: 'desc'
    }
  })
</script>