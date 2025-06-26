<template>
	<div class="pd-small error-wrapper">
		<div class="
			flex-nowrap flex
			radius-small
			pd-small
			t-white 
			bg-fourth
		">
			<p class="w-100">
				{{data.message}}
				<!-- <span class="t-semi">Ошибка: {{status}} </span> -->
				<br>
				<!-- <span>Сообщение: {{message}}</span> -->
			</p>
			
			<IconCross @click="closeError()"  class="cursor-pointer hover-scale-1 i-regular z-index-5"/>
		</div>
	</div>
</template>


<script setup="props">
	import { computed } from 'vue'
	import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

	const emits = defineEmits('close')

	const props = defineProps({
	  status: String,
	  message: String,
	  show: Boolean,
	  data: Object
	})

	function closeError () {
		emits('close')
	} 
</script>

<style lang="scss">
	.error-wrapper {
		position: absolute;
		left: 0;
		right: 0;
	}
</style>


