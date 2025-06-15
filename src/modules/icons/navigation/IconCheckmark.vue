<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
	  <path :fill="fill" fill-rule="evenodd" clip-rule="evenodd" d="M19.1081 37.3513C18.3271 38.1323 17.061 38.1323 16.2799 37.3515L7.41509 28.4891C6.63367 27.7079 6.63381 26.441 7.4154 25.66L9.04833 24.0282C9.82946 23.2476 11.0954 23.2478 11.8763 24.0287L17.6941 29.8465L36.1264 11.4142C36.9074 10.6332 38.1738 10.6332 38.9548 11.4142L40.5858 13.0452C41.3668 13.8262 41.3668 15.0926 40.5858 15.8736L19.1081 37.3513Z" />
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