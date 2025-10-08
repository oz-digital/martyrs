<template>
	<section>
		<div class="w-100 mn-b-small star-container flex-v-center flex">
	       	<span class="p-medium t-semi mn-r-small">{{rating}}</span>

	       	<svg 
	       		v-for="i in 5" 
	         	class="i-medium mn-r-small" 
	         	:class="{'t-transp': i > rating}"
	       		width="113" height="108" 
	       		viewBox="0 0 113 108" 
	       		fill="none" 
	       		xmlns="http://www.w3.org/2000/svg"
	       	>
				<path fill="rgb(var(--main))" d="M62.2406 5.85971L75.413 32.6098L105.203 36.8654C110.472 37.676 112.498 44.3636 108.648 48.0113L87.1668 68.8844L92.2331 98.2689C93.2464 103.741 87.5721 107.591 82.9111 105.159L56.3637 91.3788L29.8163 105.159C25.1553 107.794 19.4811 103.741 20.4944 98.4716L25.5607 68.8844L4.07956 48.0113C0.22917 44.3636 2.25569 37.676 7.52464 36.8654L37.3145 32.6098L50.4868 5.85971C52.9186 0.996063 59.8088 0.996063 62.2406 5.85971Z" />
			</svg>
		</div>
		<p class="">Based on {{amount}} reviews</p>
	</section>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
	rating: {
		type: Number,
		required: true,
	},
   amount: {
    type: Number,
    required: true,
  },
});

</script>