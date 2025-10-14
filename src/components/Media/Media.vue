<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import Loader from '@martyrs/src/components/Loader/Loader.vue'
import IconGallery from '@martyrs/src/modules/icons/entities/IconGallery.vue'

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
const hasStartedLoading = ref(false)
let observer = null
let isPlaying = false
let loadTimeout = null

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
  error.value = null
  isLoaded.value = true
  clearTimeout(loadTimeout)
}

// Обработка ошибок изображения
function handleImageError() {
  error.value = 'Не удалось загрузить изображение'
  isLoaded.value = false
  clearTimeout(loadTimeout)
}

// Обработка ошибок
function handleError(err) {
  error.value = `Ошибка загрузки медиа: ${err.message}`
  isLoaded.value = false
  clearTimeout(loadTimeout)
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
        // Отключаем observer сразу чтобы избежать повторных срабатываний
        observer.disconnect()

        // Защита от повторных срабатываний
        if (hasStartedLoading.value) return

        hasStartedLoading.value = true

        // Очищаем старый таймаут если он был
        if (loadTimeout) {
          clearTimeout(loadTimeout)
        }

        // Устанавливаем таймаут для обнаружения зависшей загрузки
        loadTimeout = setTimeout(() => {
          if (!isLoaded.value && !error.value) {
            error.value = 'Истекло время ожидания загрузки'
          }
        }, 10000) // 10 секунд таймаут

        if (isVideo.value && props.options?.autoplay) {
          playVideo()
        }
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
  if (loadTimeout) {
    clearTimeout(loadTimeout)
  }
})
</script>

<template>
  <div class="media-container pos-relative">
    <!-- Изображение с ленивой загрузкой и placeholder -->
    <img
      v-if="isImage"
      :src="hasStartedLoading ? url : ''"
      :data-src="url"
      :alt="options?.alt || 'Image'"
      class="media-item"
      :class="{ 'loading': !isLoaded }"
      loading="lazy"
      @load="handleLoad"
      @error="handleImageError"
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
    <div v-if="!isLoaded && !error" class="media-placeholder">
      <Loader :centered="false" />
    </div>
    
    <!-- Сообщение об ошибке -->
    <div v-if="error" class="media-error">
      <IconGallery :fill="'rgba(var(--dark), 0.1)'" />
    </div>
  </div>
</template>


<style scoped>
.media-container {
}

.media-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.media-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--light), 1);
}

.media-error svg {
  width: 50%;
  height: 50%;
}
</style>