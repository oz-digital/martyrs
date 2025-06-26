<template>
  <div class="pos-relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="h-20r radius-semi pos-relative w-100 bg-light">
      <Loader />
    </div>
    <!-- Empty State -->
    <div v-else-if="!entities.length" class="bg-light radius-semi flex flex-center w-100 h-20r">
      <p class="text-gray-500">{{t('title')}}</p>
    </div>
    <!-- Slider with loaded entities -->
    <Slider v-else :showDots="showDots">
      <div 
        v-for="(entity, key) in entities" 
        :key="key"
        class="carousel__slide pd-nano"
      >
        <transition name="fade" mode="out-in" appear>
          <slot
            :item="entity"
            :user="user"
          ></slot>
        </transition>
      </div>
    </Slider>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Loader from '@martyrs/src/components/Loader/Loader.vue'
import Slider from '@martyrs/src/components/Slider/Slider.vue'

const props = defineProps({
  showDots: Boolean,
  store: Object,
  options: Object,
  text: Object,
  user: Object
})

const entities = ref([])
const isLoading = ref(true)

const { t } = useI18n({
  messages: props.text
})

onMounted(async() => {
  try {
    entities.value = await props.store.read(props.options)
  } catch (error) {
    console.error('Error loading entities:', error)
    entities.value = []
  } finally {
    isLoading.value = false
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