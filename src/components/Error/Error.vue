<template>
	<div class="error-wrapper">
		<div class="error-card">
			<p>Ошибка {{error.status}} </p>
			<!-- <p>{{error.data.message}}</p> -->
			<!-- <button @click="closeError()" class="button-cross button-icon-medium button"><img loading="lazy" src="@/assets/icons/cross.svg"></button> -->
		</div>
	</div>
</template>


<script setup="props">
	import {computed } from 'vue'
	
	const props = defineProps({
	  error: Object
	})

	function closeError () {
	} 
</script>

<style lang="scss">
</style>


