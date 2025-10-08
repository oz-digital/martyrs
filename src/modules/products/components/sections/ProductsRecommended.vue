<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@martyrs/src/components/Button/Button.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'

import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue';
import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue';
import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue'

import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js'

const router = useRouter()
const { proxy } = getCurrentInstance()

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

// Состояние для хранения выбранных дат для товаров типа rent
const selectedDates = ref(null)

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
      const result = await proxy.$alert({
        title: 'Replace items in your cart?',
        message: `Your cart has items from another vendor. If you continue, we'll clear it so you can order from this one instead.`,
        actions: [
          { label: 'Cancel', value: false },
          { label: 'Replace', value: true }
        ]
      })

      if (!result) return
      
      shopcart.state.positions = []
    }
    
    shopcart.state.organization = organizationId
    
    // Проверяем, есть ли товары типа rent среди выбранных
    const rentProducts = selected.filter(p => p.listing === 'rent')
    let rentalDates = null
    
    // Если есть товары типа rent, получаем даты для первого товара
    if (rentProducts.length > 0) {
      const firstRentProduct = rentProducts[0]
      const firstVariant = firstRentProduct.variants?.[0]
      
      if (firstVariant) {
        rentalDates = await proxy.$dateSelector(
          firstRentProduct._id,
          firstVariant._id,
          1,
          firstVariant.price || firstRentProduct.price
        )
        
        if (!rentalDates) return // Пользователь отменил выбор дат
      }
    }
    
    // Добавляем каждый выбранный товар
    for (const product of selected) {
      // Проверяем наличие варианта
      if (!product.variants || product.variants.length === 0) continue
      
      // Используем первый вариант по умолчанию
      const variant = product.variants[0]
      
      // Для товаров типа rent используем полученные даты
      const datesToUse = product.listing === 'rent' ? rentalDates : null
      
      await shopcart.actions.addProductToCart(
        product, 
        variant,
        organizationId,
        datesToUse,
        1 // quantity
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
    <div class="recommended-products cols-4 rows-auto-1fr mobile:cols-2 gap-thin">
      
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
          :disabled="selectedProducts.length < 1"
          class="bg-main gap-micro"
          :showSuccess="false"
          :showLoader="false"
          :submit="canAddToCart ? addSelectedToCart : undefined"
        >
          <IconShopcartAdd class="i-medium"/>
          <span>Add to Cart</span>
        </Button>
      </div>
    </div>
  </div>
</template>