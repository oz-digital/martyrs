<template>
  <div v-if="products.state.current" class="w-100 mobile:pd-thin pd-small bg-white">
    <div class="cols-2 mobile:cols-1 w-100 gap-medium">

      <ProductImages
        :images="currentImages"
        :product="product"
      />

      <div class="pos-relative w-100 h-100 flex-column flex-h-center flex">
        <!-- Edit Button -->
        <router-link
          v-if="hasAccess(route.params._id, 'products', 'edit', auth.state.accesses, auth.state.access.roles)"
          :to="
            route.params._id 
            ? { name: 'Organization_ProductEdit', params: { id: route.params._id, product: product._id } } 
            : { name: 'ProductEdit', params: { product: product._id } }
          "
          class="
            z-index-2
            cursor-pointer 
            pos-absolute pos-t-zero pos-r-zero
            radius-extra pd-thin bg-second
          "
        >
          <IconEdit
            class="i-regular"
            classes="fill-white"
          />
        </router-link>

        <h2 class="w-100 h1-product mn-b-medium">{{ product.name }}</h2>

        <p v-if="product.description" class="w-100 mn-b-medium" style="white-space: pre-line;">
          {{ product.translations?.length > 1 ? t('description') : product.description }}
        </p>
       
        <!-- Компонент выбора вариантов товара -->
        <ProductConfigurator
          v-if="product.variants?.length > 0"
          :product-variants="product.variants"
          :product-id="product._id"
          :product-name="product.name"
          :discounts="product.discounts"
          :regularPrice="100"
          @variant-selected="handleVariantSelected"
          @add-to-cart="handleAddToCart"
          @update-images="handleUpdateImages"
        />

        <div v-if="product.included" class="mn-b-small flex-nowrap flex flex-v-center">
          <IconList class="mn-r-micro i-medium"/>
          <p class="t-medium ">Included</p>
        </div>

        <div v-if="product.included" class="cols-1 mn-b-medium w-100 ">
          <div
            class="w-100 pd-small radius-small flex flex-column gap-small bg-light"
          >
            <p class="t-medium" style="white-space: pre-line;" v-html="product.included"></p>
          </div>
        </div>


        <div v-if="product.attributes && product.attributes.length > 0" class="mn-b-small flex-nowrap flex flex-v-center">
          <IconInfo class="mn-r-micro i-medium"/>
          <p class="t-medium ">Product Details</p>
        </div>

        <div class="cols-2 mn-b-medium w-100 gap-small">
          <div
            v-if="product.attributes && product.attributes.length > 0"
            v-for="attributes in product.attributes"
            class="w-100 pd-small radius-small bg-light product-attributes"
          >
            <p class="mn-b-thin t-demi">{{ attributes.name }}</p>
            <p>{{ attributes.value }}</p>
          </div>
        </div>

        <div class="mn-b-small flex-nowrap flex flex-v-center">
          <IconGroups class="mn-r-micro i-medium"/>
          <p class="t-medium ">Provided by</p>
        </div>

        <CardOrganization 
          v-if="product.owner"
          :organization="product.owner.target"
          :showRating="true"
          :showFollowers="false"
          :showProducts="false"
          class="bg-light w-100 o-hidden radius-medium pd-small "
        />
      </div>
    </div>
    
    <ProductsRecommended 
      v-if="product.recommended.length > 0"
      :products="product.recommended"
      class=" mn-t-big h-max pos-relative"
    />

    <div class="h-max mn-t-big pos-relative">
      <h3 class="pd-b-small">Most Popular</h3>
      <ProductsPopular class="mn-r-big-negative mn-l-big-negative"/>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
import * as products from '@martyrs/src/modules/products/store/products.js'
import * as categories from '@martyrs/src/modules/products/store/categories.js'
import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js'

import Button from '@martyrs/src/components/Button/Button.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Tab from '@martyrs/src/components/Tab/Tab.vue'
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue'

import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue'

import IconList from '@martyrs/src/modules/icons/entities/IconList.vue';
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue'

import ProductImages from '@martyrs/src/modules/products/components/blocks/ProductImages.vue'
import ProductConfigurator from '@martyrs/src/modules/products/components/sections/ProductConfigurator.vue'
import ProductsRecommended from '@martyrs/src/modules/products/components/sections/ProductsRecommended.vue';
import ProductsPopular from '@martyrs/src/modules/products/components/sections/ProductsPopular.vue'

import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const { returnCurrency, hasAccess } = useGlobalMixins()

const product = computed(() => products.state.current)
const productImages = computed(() => products.state.current.images || [])

// Состояние для отслеживания текущих изображений (товара или варианта)
const currentImages = ref([])
// Выбранный вариант товара
const selectedVariant = ref(null)

const text = {
  en: { addtoorder: 'Add to Cart', fastorder: 'Fast Order', description: 'Description' },
  ru: { addtoorder: 'Добавить в корзину', fastorder: 'Быстрый заказ', description: 'Описание' }
}

const { t } = useI18n({ messages: text })

const emits = defineEmits(['page-loading', 'page-loaded']);

const recommendation = defineProps({
  recommendation: {
    type: Boolean,
    default: false
  }
})
  
products.state.current = null

onMounted(async () => {
  emits('page-loading');
  
  await products.actions.read({ _id: route.params.product, lookup: ['variants','recommended','inventory'] })
  
  // Инициализируем текущие изображения изображениями товара
  currentImages.value = [...productImages.value]

  if (typeof gtag === 'function') {
    gtag('event', 'view_item', {
      currency: returnCurrency(),
      value: product.value.price || 0,
      items: [{
        item_id: product.value._id,
        item_name: product.value.name,
        price: product.value.price || 0,
        item_category: product.value.category || '',
        item_brand: product.value.owner?.target?.profile.name || ''
      }]
    });
  }

  emits('page-loaded');
})

// Обработчик выбора варианта
function handleVariantSelected(variant) {
  selectedVariant.value = variant
}

// Обработчик обновления изображений при выборе варианта
function handleUpdateImages(images) {
  if (images && images.length > 0) {
    currentImages.value = [...images]
  } else {
    // Если у варианта нет изображений, возвращаем изображения товара
    currentImages.value = [...productImages.value]
  }
}

// Функция добавления товара в корзину - теперь требует выбранный вариант
async function handleAddToCart({variant, quantity}) {
  console.log('variant is', variant)
   console.log('quantity is', quantity)
  let selectedDates = null

  try {
    if (!variant) {
      throw new Error('Variant is required for adding product to cart')
    }

    if (!shopcart.state.organization) {
      shopcart.state.organization = product.value.owner.target._id
    }
    
    if (product.value.listing === 'rent') {
      selectedDates = await proxy.$dateSelector(
        product.value._id,
        variant._id,
        quantity,
        variant.price || product.value.price
      );
      
      if (!selectedDates) throw new Error('Date selection cancelled')
    }
    
    // Если организация товара отличается от текущей в корзине
    if (shopcart.state.organization !== product.value.owner.target._id) {
      const result = await proxy.$alert({
        title: 'Replace items in your cart?',
        message: `Your cart has items from another vendor. If you continue, we'll clear it so you can order from this one instead.`,
        actions: [
          { label: 'Cancel', value: false },
          { label: 'Replace', value: true }
        ]
      })

      if (!result) throw new Error('Cart replacement cancelled')

      shopcart.state.positions = []
      shopcart.state.organization = product.value.owner.target._id
    }

    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', {
        currency: returnCurrency(),
        value: variant.price || 0,
        items: [{
          item_id: product.value._id,
          item_name: product.value.name,
          price: variant.price || product.value.price || 0,
          quantity: 1,
          item_category: product.value.category || '',
          item_brand: product.value.owner?.target?.profile?.name || ''
        }]
      });
    }
 
    await shopcart.actions.addProductToCart(product.value, variant, product.value.owner.target._id, selectedDates, quantity)
    return true
  } catch (error) {
    console.error('Error while adding product to cart:', error)
    throw error
  }
}
</script>