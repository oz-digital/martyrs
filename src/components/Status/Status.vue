<template>
	<div class="pd-small error-wrapper">
		<div class="
			flex-nowrap flex-v-center flex
			radius-small
			pd-small
			t-white 
			bg-fourth
		">
			<IconInfo fill="rgb(var(--white))" class="t-transp i-medium mn-r-thin z-index-5"/>
			<p class="w-100">
				{{te(`globals.errors.${data.message}`) ? t(`globals.errors.${data.message}`) : data.message}}
			</p>
			<IconCross @click="closeError()"  class="cursor-pointer hover-scale-1 i-medium z-index-5"/>
		</div>
	</div>
</template>


<script setup="props">
	import { computed } from 'vue'
	import { useI18n } from 'vue-i18n'

	import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue';
	import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

	const { t, te } = useI18n({
		useScope: 'global',
	})

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


