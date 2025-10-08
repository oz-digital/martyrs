<template>
	<section id="main-menu" class="pos-relative">
		<h2 class="w-m-60r mn-auto pd-t-big pd-b-big t-center">
			Weed and Accessories to <br><b>Enhance Your Smoking Experience</b> 
		</h2>

		<transition name="fade" mode="out-in"  appear>
			<div v-if="!menu"  class="w-100 h-15r radius-medium flex-center bg-light">
				<Loader class="pos-relative"/>
			</div>

			<ul v-else class="gap-thin grid-container">
				<router-link :to="getMarketplaceLink([category.url])"
					v-for="(category,index) in categoriesRoot.slice(0,5)" 
					:key="category" 
					class="cursor-pointer hover-scale-0 flex-v-center flex-h-center flex-nowrap flex-row flex bg-light radius-medium pd-medium grid-item"
				>
					<img loading="lazy" 
						v-if="category.photo"
						:src="category.photo"
						class="h-100 aspect-1x1 t-transp mn-r-thin"
					>

					<div class="w-100" :class="{'mn-r-auto':category.url === 'buds'}">
						<h3 class="t-black capitalize h3">
							{{category.name}}
						</h3>
					
						<p v-if="category.url === 'buds'" class="mn-t-thin mn-b-thin t-transp t-black p-regular">
							Unveiling the Exceptional User Curated Best Buds
						</p>
						
						<button 
							v-if="category.url === 'buds'"
			        class="mn-t-small radius-extra hover-bg-black t-medium t-black bg-main hover-t-white button-small button"
			      >
			        <span>Check {{countProduct.count}} products →</span>
			      </button>
					</div>
				</router-link>

			</ul>
		</transition>
	</section>
</template>


<script setup>
	import { ref, onMounted,computed } from 'vue'

	import Loader from '@martyrs/src/components/Loader/Loader.vue'

	import { useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'
		
	import * as categories from '@martyrs/src/modules/products/store/categories.js';
	import * as products from '@martyrs/src/modules/products/store/products.js';

	const router = useRouter()

	const categoriesRoot = ref(null)
	
 	const text = {
    en: {
    	categories: []
    },
    ru: {
    	categories: []
    }
  }


	const { t  } = useI18n({
    messages: text
  })

	const countProduct = ref(0)
	const menu = ref(false)

	onMounted( async () => {
		countProduct.value = await products.actions.read({count: true})
		categoriesRoot.value = await categories.actions.read({rootOnly: true})
		menu.value = true
	})
</script>

<style lang="scss">
	.grid-container {
	  display: grid;
	  grid-template-columns: repeat(4, 1fr);
	  grid-template-rows: repeat(2, 1fr);
	}

	.grid-item {
	  &:first-of-type {
	  	grid-column: span 2;
	  	grid-row: span 2;
	  }
	}

	@media screen and (max-width: 1025px) {
    .grid-container {  grid-template-columns: repeat(2, 1fr);  }
  }
</style>
