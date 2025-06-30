<template>
<svg width="100pt" height="100pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path :fill="fill" d="m8.332 25c0-4.6016 3.7305-8.332 8.3359-8.332h66.664c4.6055 0 8.3359 3.7305 8.3359 8.332v50c0 4.6016-3.7305 8.332-8.3359 8.332h-66.664c-4.6055 0-8.3359-3.7305-8.3359-8.332zm14.66 0 27.008 23.629 27.004-23.629zm60.34 5.5352-30.59 26.766c-1.5703 1.375-3.9141 1.375-5.4844 0l-30.59-26.766v44.465h66.664z"/>
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