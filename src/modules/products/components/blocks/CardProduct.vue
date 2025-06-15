<template>
	<div 
		class="
			radius-medium 
			cols-1
			o-hidden
			pos-relative
		"
	>
		<!-- Edit Button -->
		<router-link
			v-if="access"
      :to="organization ? { name: 'Organization_ProductEdit', params: { id: organization, product: product._id } } : { name: 'ProductEdit', params: { product: product._id } }"
      class="
      	z-index-2
        cursor-pointer 
        pos-absolute pos-t-regular pos-r-regular
        radius-extra pd-thin bg-second
      "
    >
      <IconEdit
        class="i-regular"
        classes="fill-white"
      />
    </router-link>

		<!-- Product Image Sqaure -->
		<div 
			class="o-hidden d-flex  pd-thin pd-b-zero radius-medium o-hidden w-100 pos-relative aspect-1x1"
		>
			<div class="w-100  h-100 pos-relative">
				<!-- Image Wrappers  -->
				<img loading="lazy" 
					v-if="product.images[0]" 
					:src="(FILE_SERVER_URL || '') + product.images[0].split('/').slice(0, -1).join('/') + '/thumbnail_' + product.images[0].split('/').pop()"
					class="pos-absolute object-fit-cover radius-small h-max-100 h-100  w-100"
				>

				<PlaceholderImage
					v-else
					class="radius-medium h-100 w-100"
				/>
				<span v-if="product.available <= 0 && product.listing !== 'rent'" class="pos-absolute bg-white t-black pd-thin radius-medium p-small t-medium pos-t-medium pos-l-medium">Out of Stock</span>
				<THC v-if="product.attributes?.length > 0 && product.attributes[1]?.name === 'THC'" :product="product" />
			</div>
		</div>

		<!-- Product Info Start -->
		<div  class="pd-small cols-1 t-left">
			<!-- Detail -->
			<p 
				v-if="product.attributes.length > 0"  
				class="t-semi t-transp p-small mn-b-micro"
			>
				{{product.attributes[0].value}}
			</p>
			<!-- Name -->
			<span style=" hyphens: auto;" class="word-break t-truncate p-medium mn-b-thin w-100 w-max-100 ">
				{{product.name}}
			</span>

			<p 
				v-if="product.description && !product.translations && product.listing !== 'rent'" 
				class="mn-b-small t-transp p-small"
			>
				{{product.description.substring(0, 99)}}...
			</p>

			<div class="flex-v-center flex-nowrap flex">
				<Price 
					:product="product" 
					size="small" 
					class="bg-white h-100 p-medium flex flex-center pd-r-small pd-l-small radius-small mn-r-auto" 
				/>
				
				<button
					v-if="user"
		      class="
		        cursor-pointer 
		        radius-extra pd-thin bg-main
		      "
		    >
		      <IconShopcartAdd
						class="icon-button-main i-medium"
					/>
		    </button>
		  </div>
		</div>

	</div>

</template>


<script setup="props">
	import {computed } from 'vue'
	import { useI18n }    from 'vue-i18n'

	import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
	import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue'

	import THC from '@martyrs/src/modules/products/components/elements/THC.vue'
	import Price from '@martyrs/src/modules/products/components/elements/Price.vue'

	import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'

	const props = defineProps({
		product: {
			type: Object
		},
		access: {
			type: Boolean,
			default: false
		},
		organization: {
			type: String
		},
		user: {
			type: [Object, String] 
		},
		type: {
			type: Object
		}
	})

  const { t } = useI18n()
</script>

<style lang="scss">
.word-break {
  width: 100%; 
  overflow: auto;
  overflow-wrap: break-word;
  word-break: break-all;
  white-space: -moz-pre-wrap;
  white-space: -hp-pre-wrap;
  white-space: -o-pre-wrap;
  white-space: -pre-wrap; 
  white-space: pre-wrap; 
  white-space: pre-line; 
  word-wrap: break-word;
}
</style>


