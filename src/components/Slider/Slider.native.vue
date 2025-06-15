<template>
  <div class="pos-relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="h-20r radius-semi pos-relative w-100 bg-light">
      <Loader />
    </div>
    <!-- Empty State -->
    <div v-else-if="!entitiesState.length" class="bg-light radius-semi flex flex-center w-100 h-20r">
      <p class="text-gray-500">{{t('title')}}</p>
    </div>
    <!-- Native Carousel -->
    <div v-else class="carousel" ref="carouselRef">
      <div class="carousel__container" @scroll="handleScroll">
        <div 
          class="carousel__slide pd-nano" 
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
      
      <!-- Navigation Dots (optional) -->
      <div class="carousel__dots" v-if="showDots && entitiesState.length > 1">
        <button 
          v-for="(_, index) in entitiesState" 
          :key="index"
          class="carousel__dot"
          :class="{ 'carousel__dot--active': selectedIndex === index }"
          @click="scrollTo(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Loader from '@martyrs/src/components/Loader/Loader.vue'

// Props for customization
const props = defineProps({
  showDots: Boolean,
  store: Object,
  options: Object,
  text: Object,
  user: Object
});

const router = useRouter()
const carouselRef = ref(null)
const entitiesState = ref([])
const isLoading = ref(true)
const selectedIndex = ref(0)
const autoplayInterval = ref(null)
const scrollTimeout = ref(null)

const { t } = useI18n({
  messages: props.text
})

// Scroll to specific slide
const scrollTo = (index) => {
  if (!carouselRef.value) return
  
  const container = carouselRef.value.querySelector('.carousel__container')
  const slides = container.querySelectorAll('.carousel__slide')
  
  if (slides[index]) {
    container.scrollTo({
      left: slides[index].offsetLeft,
      behavior: 'smooth'
    })
    
    selectedIndex.value = index
  }
}

// Handle scroll event with debounce
const handleScroll = () => {
  // Clear previous timeout
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
  
  // Set a timeout to update the index when scrolling stops
  scrollTimeout.value = setTimeout(() => {
    updateSelectedIndex()
  }, 50) // Small delay to ensure scroll has completed
}

// Update selected index when scrolling
const updateSelectedIndex = () => {
  if (!carouselRef.value) return
  
  const container = carouselRef.value.querySelector('.carousel__container')
  const slides = container.querySelectorAll('.carousel__slide')
  
  if (!slides.length) return
  
  const scrollPosition = container.scrollLeft
  const slideWidth = slides[0].offsetWidth
  
  // Find current slide index based on scroll position
  const index = Math.round(scrollPosition / slideWidth)
  
  // Ensure index is within bounds
  const boundedIndex = Math.max(0, Math.min(index, entitiesState.value.length - 1))
  
  // Update selected index
  selectedIndex.value = boundedIndex
}

// Setup autoplay functionality
const setupAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
  }
  
  autoplayInterval.value = setInterval(() => {
    const nextIndex = (selectedIndex.value + 1) % entitiesState.value.length
    scrollTo(nextIndex)
  }, 2000) // 2 seconds interval like in original
}

onMounted(async() => {
  try {
    entitiesState.value = await props.store.read(props.options)
  } catch (error) {
    console.error('Error loading entities:', error)
    entitiesState.value = []
  } finally {
    isLoading.value = false
  }
  
  // Initialize native carousel after entities are loaded
  if (entitiesState.value.length && carouselRef.value) {
    // Listen for scroll end using intersection observer for better performance
    const container = carouselRef.value.querySelector('.carousel__container')
    const slides = container.querySelectorAll('.carousel__slide')
    
    // Create intersection observer to detect when slides are visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find the index of the visible slide
          const slideIndex = Array.from(slides).indexOf(entry.target)
          if (slideIndex !== -1) {
            selectedIndex.value = slideIndex
          }
        }
      })
    }, {
      root: container,
      threshold: 0.7 // Consider slide visible when 70% is in view
    })
    
    // Observe all slides
    slides.forEach(slide => {
      observer.observe(slide)
    })
    
    // Add focus/blur events to pause autoplay on focus
    container.addEventListener('focusin', () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value)
      }
    })
    
    container.addEventListener('focusout', () => {
      setupAutoplay()
    })
    
    // Stop autoplay on touch/mouse interaction
    container.addEventListener('mousedown', () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value)
      }
    })
    
    container.addEventListener('touchstart', () => {
      if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value)
      }
    })
    
    // Resume autoplay after interaction ends
    container.addEventListener('mouseup', () => {
      setupAutoplay()
    })
    
    container.addEventListener('touchend', () => {
      setupAutoplay()
    })
    
    // Initialize autoplay
    setupAutoplay()
    
    // Store observer for cleanup
    carouselRef.value._observer = observer
  }
})

onBeforeUnmount(() => {
  // Clean up all resources
  if (carouselRef.value) {
    // Clean up intersection observer
    if (carouselRef.value._observer) {
      carouselRef.value._observer.disconnect()
    }
    
    // Clean up event listeners
    const container = carouselRef.value.querySelector('.carousel__container')
    if (container) {
      container.removeEventListener('focusin', () => {})
      container.removeEventListener('focusout', () => {})
      container.removeEventListener('mousedown', () => {})
      container.removeEventListener('touchstart', () => {})
      container.removeEventListener('mouseup', () => {})
      container.removeEventListener('touchend', () => {})
    }
  }
  
  // Clear all timeouts and intervals
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
  }
  
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})

// Watch for changes in entities to reinitialize if needed
watch(entitiesState, (newValue) => {
  if (newValue.length && carouselRef.value) {
    // Reset to first slide
    selectedIndex.value = 0
    scrollTo(0)
    
    // Reset autoplay
    setupAutoplay()
  }
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel__container {
  display: flex;
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scroll-behavior: smooth;
}

.carousel__container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* Navigation dots */
.carousel__dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.carousel__dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.carousel__dot--active {
  background-color: rgba(0, 0, 0, 0.6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>