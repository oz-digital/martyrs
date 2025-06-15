<template>
<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 26H48M26 4V48" :stroke="fill" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</template>

<script setup>
const props = defineProps({
  fill: {
    type: String,
    default: 'rgb(var(--black))'
  }
})
</script>