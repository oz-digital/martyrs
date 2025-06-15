<template>
<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M26.0346 14.9709V37.2577M15.6412 26.1143H36.428M50.0358 26.1143C50.0358 39.3698 39.2901 50.1155 26.0346 50.1155C12.7791 50.1155 2.03342 39.3698 2.03342 26.1143C2.03342 12.8588 12.7791 2.1131 26.0346 2.1131C39.2901 2.1131 50.0358 12.8588 50.0358 26.1143Z" :stroke="fill" stroke-width="3.21445" stroke-linecap="round" stroke-linejoin="round"/>
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