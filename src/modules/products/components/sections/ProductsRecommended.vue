<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@martyrs/src/components/Button/Button.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'

import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue';
import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue';
import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue'

import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js'

const router = useRouter()

// Props
const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Состояние выбранных товаров - массив id товаров с вариантами
const selectedProducts = ref(props.products.filter(p => p.variants?.length > 0).map(p => p._id))

// Вычисляемая общая цена
const totalPrice = computed(() => {
  return props.products
    .filter(p => selectedProducts.value.includes(p._id))
    .reduce((sum, p) => {
      const price = p.variants?.[0]?.price || 0
      return sum + price
    }, 0)
    .toFixed(2)
})

// Проверка возможности добавления в корзину
const canAddToCart = computed(() => {
  const selected = props.products.filter(p => selectedProducts.value.includes(p._id))
  return selected.length > 0 && selected.some(p => p.variants?.length > 0)
})

const handleProductClick = (product) => {
  if (product?._id && product?.owner?.target) {
    router.push({
      name: 'Organization_Product', 
      params: { 
        _id: product.owner.target, 
        product: product._id 
      } 
    })
  }
}

// Добавление выбранных товаров в корзину
const addSelectedToCart = async () => {
  const selected = props.products.filter(p => selectedProducts.value.includes(p._id))
  
  if (selected.length === 0) return
  
  try {
    // Берем организацию первого товара
    const firstProduct = selected[0]
    const organizationId = firstProduct.owner?.target?._id || firstProduct.owner?.target
    
    // Проверяем, что в корзине товары той же организации
    if (shopcart.state.organization && shopcart.state.organization !== organizationId) {
      // Можно добавить подтверждение замены корзины
      shopcart.state.positions = []
    }
    
    shopcart.state.organization = organizationId
    
    // Добавляем каждый выбранный товар
    for (const product of selected) {
      // Проверяем наличие варианта
      if (!product.variants || product.variants.length === 0) continue
      
      await shopcart.actions.addProductToCart(
        product, 
        organizationId,
        null // selectedDates для rent листинга
      )
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}
</script>

<template>
  <div>
    <h3 class="mn-b-small">Frequently Bought Together</h3>
    <div class="recommended-products cols-4 mobile:cols-2 gap-thin">
      
      <CardProduct  
        v-for="(product, index) in products" 
        :key="product?._id || index"
        :product="product"
        class="h-100 bg-light"
        @click="handleProductClick(product)"
        :showAddToCart="false"
      >
        <Checkbox
          v-model:radio="selectedProducts"
          :value="product._id"
          mode="checkbox"
          :validation="!product.variants || product.variants.length === 0"
          class="pos-r-small pos-t-small pos-absolute"
          @click.stop
        />
      </CardProduct>

      <div class="flex-center flex flex-column pd-small radius-small br-solid br-1px br-light">
        <div class="mn-b-thin i-extra pd-small bg-light radius-extra">
          <IconProducts class="i-big"/>
        </div>
        <p class="mn-b-small">Total price:</p>
        <p class="mn-b-medium h3 t-medium">${{ totalPrice }}</p>
        <Button 
          class="bg-main gap-micro"
          :submit="canAddToCart ? addSelectedToCart : undefined"
        >
          <IconShopcartAdd class="i-semi"/>
          <span>Add to Cart</span>
        </Button>
      </div>
    </div>
  </div>
</template>