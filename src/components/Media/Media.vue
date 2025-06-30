<template>
  <div class="media-container pos-relative">
    <!-- Изображение с ленивой загрузкой и placeholder -->
    <img
      v-if="isImage"
      :src="isIntersecting ? url : ''"
      :data-src="url"
      :alt="options?.alt || 'Image'"
      class="media-item"
      :class="{ 'loading': !isLoaded }"
      loading="lazy"
      @load="handleLoad"
      v-bind="options"
      ref="imageElement"
    />
    
    <!-- Видео с предварительной загрузкой -->
    <video
      v-else-if="isVideo"
      ref="videoElement"
      :class="{ 'loading': !isLoaded }"
      class="media-item"
      :controls="!options?.hideControls"
      :loop="options?.loop !== false"
      :muted="options?.muted !== false"
      :autoplay="options?.autoplay"
      :playsinline="options?.playsinline !== false"
      :preload="options?.preload || 'metadata'"
      @loadeddata="handleLoad"
      v-bind="options"
    >
      <source :src="url" :type="videoType">
    </video>
    
    <!-- Плейсхолдер во время загрузки -->
    <div v-if="!isLoaded" class="media-placeholder">
      Loading...
    </div>
    
    <!-- Сообщение об ошибке -->
    <div v-if="error" class="media-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      muted: true,
      loop: true,
      playsinline: true,
      preload: 'metadata' // 'none' | 'metadata' | 'auto'
    })
  }
})

// Refs
const videoElement = ref(null)
const imageElement = ref(null)
const isLoaded = ref(false)
const error = ref(null)
const isIntersecting = ref(false)
let observer = null
let isPlaying = false

// Определяем тип медиа
const fileExtension = computed(() => {
  return props.url?.split('.')?.pop()?.toLowerCase()
})

const isImage = computed(() => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
  return imageExtensions.includes(fileExtension.value)
})

const isVideo = computed(() => {
  const videoExtensions = ['mp4', 'webm', 'ogg']
  return videoExtensions.includes(fileExtension.value)
})

// Определяем MIME-тип для видео
const videoType = computed(() => {
  const types = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg'
  }
  return types[fileExtension.value] || ''
})

// Обработчик загрузки медиа
function handleLoad() {
  isLoaded.value = true
}

// Обработка ошибок
function handleError(err) {
  error.value = `Ошибка загрузки медиа: ${err.message}`
  isLoaded.value = false
}

// Управление видео с обработкой ошибок
async function playVideo() {
  if (!videoElement.value) return
  
  try {
    if (videoElement.value.paused && !isPlaying) {
      await videoElement.value.play()
      isPlaying = true
    }
  } catch (err) {
    handleError(err)
  }
}

function checkAndPlayVideo() {
  if (!videoElement.value) return
  
  videoElement.value.onplaying = () => {
    isPlaying = true
  }
  
  videoElement.value.onpause = () => {
    isPlaying = false
  }
  
  videoElement.value.onerror = handleError
}

// Intersection Observer для ленивой загрузки
function setupIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isIntersecting.value = entry.isIntersecting
      
      if (entry.isIntersecting) {
        if (isVideo.value && props.options?.autoplay) {
          playVideo()
        }
        // Отключаем observer после первой загрузки
        observer.disconnect()
      }
    })
  }, options)
  
  // Наблюдаем за элементом в зависимости от типа медиа
  const element = isImage.value ? imageElement.value : videoElement.value
  if (element) {
    observer.observe(element)
  }
}

// Lifecycle hooks
onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.media-container {
}

.media-item {
  all: inherit;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.media-item.loading {
  opacity: 0;
}

.media-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.media-error {
  color: #ff4444;
  padding: 1rem;
  text-align: center;
}
</style>