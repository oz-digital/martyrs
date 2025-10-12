<template>
	<div class="cols-2-1_2 pd-small w-100 gap-thin">
		
		<div class="pd-small  bg-light radius-medium flex-nowrap flex-column flex pos-relative">
			<div class="w-100 bg-light radius-semi o-hidden">
				<!-- PRODUCT IMAGE -->
				<Image360
					v-if="product && product.image3d"
					class="h-100 w-100"
					:imagePath="`/assets/images/products/${product.image3d}`"
					:imageCount="36"
				/>

				<img loading="lazy" 
					v-if="images[0] && !product.image3d"
					class="h-max bg-light w-100"
					style="object-fit: contain;"
					:src="(FILE_SERVER_URL || '') + images[0]"
				/>

				<PlaceholderImage
					v-if="!images[0] && !product.image3d"
					class="h-max-20r h-100 w-100"
					style="object-fit: cover;"
				/>

			</div>

			<ProductImages
				v-if="images.length > 1"
				:images="images"
				class="mn-t-thin"
			/>
		</div>

		<div class="radius-medium pos-relative w-100 h-100 flex-column flex-justify flex col">

			<IconEdit
				v-if="accesses && hasAccess(route.params._id, 'products', 'edit', accesses)"
				@click="$router.push({
					name: route.meta.context === 'backoffice' ? 'BackofficeProductEdit' : 'Organization_ProductEdit',
					params: {
						_id: product.owner.target,
						product: product._id
					}
				})"
				class="pos-absolute pos-t-regular pos-r-regular i-medium t-transp"
			/>

			<h2 v-if="recommendation" class="t-main t-semi p-medium">{{t('airecommend')}}</h2>
			<!-- Name -->
			<h1 class="w-100 h1-product mn-b-small">{{ product.name }}</h1>
			<!-- Price -->
			<Price v-if="product.listing !== 'rent'" :product="product" size="big" class="mn-b-semi" />
			<!-- Variants -->
			<!-- <div v-if="product.variants.length > 0" class="flex-nojustify  flex">
				<SelectElement v-if="sizes2.length > 0" :elements="sizes2" :selected="product.selectedSize" class="mn-r-medium" />
			</div> -->
			<!-- Description -->
			<h3 v-if="recommendation" class="mn-b-semi">
				{{ recommendation }}
			</h3>

			<Tab 
				v-model:selected="tabProduct"
				:tabs="[
					{name: 'Description', value: 'description'},
					{name: 'Specifications', value: 'specifications'}
				]"
				classTab="pd-small pd-r-medium pd-l-medium w-100 pd-small radius-small"
				class="bg-light mn-b-small"
			/>

			<div class="h-min-5r pos-relative">
				<transition name="slide-fade">

					<div v-if="tabProduct === 'description'"  class="pd-medium radius-medium bg-light ">
						<p v-if="product.description && !product.translations < 1 && !recommendation" class="w-100 t-transp">
							{{ product.description }}
						</p>

						<p v-if="product.translations && product.translations.length > 1 && !recommendation" class="w-100 t-transp">
							{{ t('description') }}
						</p>
					</div>

					<div 
						v-else
						class="cols-2 w-100 bg-light radius-medium pd-medium gap-small"
					>
						<div 
							v-if="product.attributes.length > 0" 
							v-for="attributes in product.attributes" 
							class="w-100 pd-small radius-small bg-white product-attributes"
						>
							<p class="t-demi">{{ attributes.name }}</p>
							<p>{{ attributes.value }}</p>
						</div>
					</div>
				</transition>
			</div>

			<div v-if="product.listing === 'rent'" class="mn-t-small max-w-33rem mobile-w-100 t-white gap-small cols-2">
				<Button
					:submit="() => { addToCart(product) } " 
					:text="{
						success: ' ✔ Added',
						error: 'error'
					}"
					class="h-3r w-100 mn-r-small bg-main button"
				> 
					{{ t('addtoorder') }}
				</Button>
			</div>

			<!-- Actions -->
			<div v-else class="mn-t-small max-w-33rem mobile-w-100 t-white gap-small cols-2">
				<Button
					v-if="product.quantity > 0"
					:submit="a => addToCart(product)" 
					:disabled="validateToCard(product)" 
					:text="{
						success: ' ✔ Added',
						error: 'error'
					}"
					class="h-3r w-100 mn-r-small bg-main button"
				> 
						{{ t('addtoorder') }}
				</Button>
				<div v-else class="flex-center flex uppercase radius-medium t-black w-max pd-small t-medium bg-grey h-3r w-100 mn-r-smallbutton">
					Out of Stock
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import Button from '@martyrs/src/components/Button/Button.vue'
import Tab from '@martyrs/src/components/Tab/Tab.vue'
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'

import Image360 	from '@martyrs/src/modules/products/components/elements/Image360.vue'
import ProductImages from "@martyrs/src/modules/products/components/blocks/ProductImages.vue";

import THC from '@martyrs/src/modules/products/components/elements/THC.vue'
import Price from '@martyrs/src/modules/products/components/elements/Price.vue'
// import SelectElement 	from '@/components/elements/SelectElement.vue'

import { computed, ref } from 'vue'

	import { useRoute,useRouter } from 'vue-router'
import { useI18n }    from 'vue-i18n'

import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js';

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  user: {
    type: String,
  },
  accesses: {
    type: Object,
	  default: null
  },
  recommendation: {
  	type: String
  }
})



	const route = useRoute()
	const router = useRouter()

// Computed properties
const images = computed(() => {
  return props.product.images
})

const tabProduct = ref('description')

const text = {
	messages: {
	  en: {
	  	airecommend: 'AI Recommends You',
	  	description: '',
	  	addtoorder: 'Add to order',
	    fastorder: 'Fast Order'
	  },
	  ru: {
	  	airecommend: 'AI Рекомендует вам',
	  	description: '',
	  	addtoorder: 'Добавить в корзину',
	    fastorder: 'Быстрый заказ'
	  }
	}
}

const { t } = useI18n(text)

// Methods
function validateToCard(product) {
  if (product.quantity > 0) {
    return false
  }
  return true
}
async function addToCart(product) {
	console.log(product)
    try {
        if (shopcart.state.organization !== product.owner.target) {
            shopcart.state.organization = product.owner.target
            shopcart.state.positions = []
        }
        await shopcart.actions.addProductToCart(product, product.owner.target)
        return true // Make sure we return something
    } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error)
        throw error
    }
}
</script>
