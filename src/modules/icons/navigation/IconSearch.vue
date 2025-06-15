<template>
  <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path :fill="none" :stroke="fill" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" :class="$attrs.class" d="M22.5 36C30.5081 36 37 29.5081 37 21.5C37 13.4919 30.5081 7 22.5 7C14.4919 7 8 13.4919 8 21.5C8 29.5081 14.4919 36 22.5 36Z"/>
    <path :fill="none" :stroke="fill" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" :class="$attrs.class" d="M33 32L42 41"/>
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