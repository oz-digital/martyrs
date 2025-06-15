<template>
	<div 
    class="font-main"
   >
   	<slot></slot>
		<span 
			v-if="chips?.length"
		  v-for="(chip,index) in chips" 
		  :class="$attrs.class || 'p-medium font-main'"
		 	class="mn-r-nano d-inline-block w-max pd-b-micro pd-t-micro pd-r-thin pd-l-thin radius-small t-medium bg-main" 
		>
			<span class="text-box-trim-none t-truncate">{{chip.text ? chip.text : chip}}</span>
		</span>

		<div 
			v-else
			class="pd-b-micro pd-t-micro pd-r-thin pd-l-thin radius-small t-semi bg-white" 
		>
			<slot></slot>
		</div>
	</div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps(['chips']);
</script>

<style>
	.t-trimmed {
		font-size: 0;
	}
</style>