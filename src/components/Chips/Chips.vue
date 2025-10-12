<template>
	<div 
    class="font-main"
   >
   	<slot></slot>
		<p 
			v-if="chips?.length"
		  v-for="(chip,index) in chips" 
		  :class="'p-regular font-main'"
		 	class="mn-r-nano d-inline-block w-max p-regular pd-thin radius-thin t-medium bg-main" 
		>
			{{chip.text ? chip.text : chip}}
		</p>

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
</style>