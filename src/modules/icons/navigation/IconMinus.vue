<template>
	<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15.6078 26.1143H36.3946M50.0024 26.1143C50.0024 39.3698 39.2567 50.1155 26.0012 50.1155C12.7457 50.1155 2 39.3698 2 26.1143C2 12.8588 12.7457 2.1131 26.0012 2.1131C39.2567 2.1131 50.0024 12.8588 50.0024 26.1143Z" :stroke="fill" stroke-width="3.21445" stroke-linecap="round"/>
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
