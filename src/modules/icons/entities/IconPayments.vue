<template>
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 14C9.87827 14 7.84344 14.8429 6.34315 16.3431C4.84285 17.8434 4 19.8783 4 22V38C4 40.1217 4.84285 42.1566 6.34315 43.6569C7.84344 45.1571 9.87827 46 12 46H44C46.1217 46 48.1566 45.1571 49.6569 43.6569C51.1571 42.1566 52 40.1217 52 38V22C52 19.8783 51.1571 17.8434 49.6569 16.3431C48.1566 14.8429 46.1217 14 44 14H12ZM4 26H52V30H4V26ZM42 34H36V38H42V34Z" :fill="fill"/>
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