<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
	  <circle cx="6" cy="24" r="6" :fill="fill" :class="$attrs.class"/>
	  <circle cx="24" cy="24" r="6" :fill="fill" :class="$attrs.class"/>
	  <circle cx="42" cy="24" r="6" :fill="fill" :class="$attrs.class"/>
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