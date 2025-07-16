<template>
<svg width="100pt" height="100pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<path :fill="fill" d="m50 16.668c6.8672 0 12.5 5.6328 12.5 12.5v12.5h-25v-12.5c0-6.8672 5.6328-12.5 12.5-12.5zm20.832 25v-12.5c0-11.469-9.3633-20.836-20.832-20.836s-20.832 9.3672-20.832 20.836v12.5h-4.168c-4.6016 0-8.332 3.7305-8.332 8.332v33.332c0 4.6055 3.7305 8.3359 8.332 8.3359h50c4.6016 0 8.332-3.7305 8.332-8.3359v-33.332c0-4.6016-3.7305-8.332-8.332-8.332zm-45.832 8.332h50v33.332h-50z"/>
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