<template>
  <div class="embla" ref="emblaNode">
    <div class="embla__container">
      <div 
        class="embla__slide h-100 pos-relative pd-nano" 
        v-for="(value, key) in productsState" 
        :key="value?._id || key"
      >
        <router-link  
          :to="{ name: 'Organization_Product', params: { _id: value.owner.target, product: value._id  } }"
          class="h-100 pos-relative"
        >
          <transition name="fade" mode="out-in" appear>
            <div 
              v-if="isLoading || !value?.name" 
              class="h-100 w-100 radius-medium flex-center bg-light"
            >
              <Loader class="pos-relative"/>
            </div>
            
            <CardProduct  
              v-else
              :key="value._id" 
              :product="value"
              class="h-max-40r h-100 bg-light"
            />
          </transition>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
    
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'

import Loader from '@martyrs/src/components/Loader/Loader.vue'

import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

import * as products from '@martyrs/src/modules/products/store/products.js'

const router = useRouter()
const productsState = ref([]) // Инициализируем как пустой массив
const isLoading = ref(true)
const selectedIndex = ref(0)
const scrollSnaps = ref([])

// Конфигурация автоплея
const autoplayOptions = {
  delay: 2000,
  jump: false,
  stopOnInteraction: false,
  stopOnMouseEnter: false,
  stopOnFocusIn: true,
  stopOnLastSnap: false,
  rootNode: (emblaRoot) => emblaRoot.parentElement
}

// Инициализация карусели
const [emblaNode, emblaApi] = emblaCarouselVue(
  { loop: true }, 
  [Autoplay(autoplayOptions)]
)

// Методы управления каруселью
const scrollTo = (index) => emblaApi.value?.scrollTo(index)
const onInit = () => {
  if (emblaApi.value) {
    scrollSnaps.value = emblaApi.value.scrollSnapList()
  }
}
const onSelect = () => {
  if (emblaApi.value) {
    selectedIndex.value = emblaApi.value.selectedScrollSnap()
  }
}

// Обработчик клика по продукту
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

// Загрузка данных
const loadProducts = async () => {
  try {
    isLoading.value = true
    const response = await products.actions.read({
      limit: 10, 
      organization: '657e7134efb8110c51b8b713'
    })
    productsState.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('Error loading products:', error)
    productsState.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Загружаем данные
  await loadProducts()
  
  // Инициализируем карусель
  onInit()
  onSelect()
  
  // Добавляем слушатели событий
  if (emblaApi.value) {
    emblaApi.value.on('reInit', onInit)
    emblaApi.value.on('reInit', onSelect)
    emblaApi.value.on('select', onSelect)
  }
})

// Очистка слушателей при размонтировании
onUnmounted(() => {
  if (emblaApi.value) {
    emblaApi.value.off('reInit', onInit)
    emblaApi.value.off('reInit', onSelect)
    emblaApi.value.off('select', onSelect)
  }
})
</script>

<style lang="scss">
.embla {
  overflow: hidden;
}
.embla__container {
  display: flex;
}
.embla__slide {
  flex: 0 0 25%;
  min-width: 0;
}
@media screen and (max-width: 1025px) {
  .embla__slide {
    flex: 0 0 75%;
    min-width: 0;
  }
}
</style>