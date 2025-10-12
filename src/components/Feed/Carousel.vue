<template>
  <div class="pos-relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="h-20r radius-semi pos-relative w-100 bg-light">
      <Loader />
    </div>
    <!-- Empty State -->
    <EmptyState
      v-else-if="entities.length < 1"
      :title="states.empty.title"
      :description="states.empty.description"
      :action="states.empty.action"
      :callback="states.empty.callback"
      :class="replaceClasses('pd-medium bg-light radius-medium', states.empty.class)"
    />
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
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';
import Loader from '@martyrs/src/components/Loader/Loader.vue'
import Slider from '@martyrs/src/components/Slider/Slider.vue'
import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';

const { replaceClasses } = useGlobalMixins();

const props = defineProps({
  showDots: Boolean,
  store: Object,
  states: {
    type: Object,
    default: () => ({
      empty: {
        title: 'Nothing found',
        description: 'Sorry, nothing found',
      },
    }),
  },
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
    isLoading.value = false
  } catch (error) {
    console.error('Error loading entities:', error)
    entities.value = []
    isLoading.value = false
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