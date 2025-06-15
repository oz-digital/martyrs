<template>
	<section class="">
		<header class="mn-b-big t-center">
			<h2 class="mn-center text-fade-in"><span class="text-splitted">Example of the Strains</span></h2> 
		</header>
		<div class="cols-4 w-100 o-scroll pos-relative gap-medium">
      <img loading="lazy"  v-for="(signal,index)  in signals"   class="radius-medium h-max-30r signal" :src="'/images/examples/' + signal">
		</div>
	</section>
</template>

<script setup>
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
// VUE DEPENDENCIES
import { onMounted } from 'vue';
/////////////////////////////
// CREATED
/////////////////////////////

let signals = [
  '01.png',
  '02.png',
  '03.png',
  '04.png',
]

/////////////////////////////
// MOUNTED
/////////////////////////////
onMounted(() => {
})

</script>

<style lang="scss">
</style>
