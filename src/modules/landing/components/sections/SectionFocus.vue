<template>
	<section id="our-focus" class="bg-light radius-medium pd-big cols-2 flex">
		
		<div class="col">
			
			<p class="text-fade-in mn-b-medium t-main h4">
				<span class="text-splitted">Culture of cannabis</span>
			</p>

			<h2 class="text-fade-in mn-b-medium">
				<span class="text-splitted">Welcome to Weeder Farms, your trusted partner in cannabis cultivation. </span>
			</h2> 

			<p class="element-intro display-block p-semi">We are a team of professional growers, engineers, programmers, and geneticists. We are dedicated to the growth and development of the cannabis industry, offering our extensive experience and knowledge to help cultivators like you succeed.</p>
		</div>

		<div class="cols-2 gap-thin col">
			<div :ref="setItemRef" class="industry card">
				<h3 class="h1 t-main card-child">10+</h3>
				<p class="h4 card-child">Farms</p>
			</div>
			<div :ref="setItemRef" class="industry card">
				<h3 class="h1 t-main card-child">40</h3>
				<p class="h4 card-child">Strains</p>
			</div>
			<div :ref="setItemRef" class="industry card">
				<h3 class="h1 t-main card-child">10KG</h3>
				<p class="h4 card-child">Monthly</p>
			</div>
			<div :ref="setItemRef" class="industry card">
				<h3 class="h1 t-main card-child">5+</h3>
				<p class="h4 card-child">Dispansaries</p>
			</div>
			<div :ref="setItemRef" class="industry card">
				<h3 class="h1 t-main card-child">136</h3>
				<p class="h4 card-child">Tokens</p>
			</div>
		</div>
	</section>
</template>


<script setup>
import { reactive, computed, toRefs, ref, onMounted,onUpdated,inject } from 'vue';

onMounted(() => {

})
 
</script>

<style scoped lang="scss">
#our-focus {
 .industry {
 		display: flex;
    justify-content: flex-end;
 }
}
</style>
