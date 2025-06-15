<template>
  <div class="pos-relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="h-20r radius-semi pos-relative w-100 bg-light">
      <Loader />
    </div>

    <!-- Empty State -->
    <div v-else-if="!entitiesState.length" class="bg-light radius-semi  flex flex-center  w-100 h-20r">
      <p class="text-gray-500">{{t('title')}}</p>
    </div>

    <!-- Carousel -->
    <div v-else class="embla" ref="emblaNode">
      <div class="embla__container">
        <div 
          class="embla__slide pd-nano" 
          v-for="(entity, key, index) in entitiesState" 
          :key="key"
        >
          <transition name="fade" mode="out-in" appear>
            <slot
              :item="entity"
              :user="user"
            ></slot>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'

import Loader from '@martyrs/src/components/Loader/Loader.vue'

// Props for customization
const props = defineProps({
  store: Object,
  options: Object,
  text: Object,
  user: Object
});

const router = useRouter()
const entitiesState = ref([])
const isLoading = ref(true);
const selectedIndex = ref(0);


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

const { t } = useI18n({
  messages: props.text
})

onMounted(async() => {
  try {
    entitiesState.value = await props.store.read(props.options);
  } catch (error) {
    console.error('Error loading entities:', error);
    entitiesState.value = [];
  } finally {
    isLoading.value = false;
  }
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>