<template>
  <div class="product-360-viewer">
    <svg class="pos-absolute z-index-2 pos-b-0 pd-small" width="73" height="50" viewBox="0 0 73 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42.5934 17.2017C42.5934 20.8208 39.8428 23.7544 36.45 23.7544C33.0573 23.7544 30.3066 20.8208 30.3066 17.2017C30.3066 13.5826 33.0573 10.6484 36.45 10.6484C39.8428 10.6484 42.5934 13.5826 42.5934 17.2017Z" fill="rgb(var(--black))" fill-opacity="0.1"/>
      <path d="M22.5953 29.4883H50.3053C53.7389 29.4883 56.5197 26.778 56.5197 23.4405V10.8396C56.5197 7.49996 53.739 4.79176 50.3053 4.79176H48.8712C48.2747 2.05313 45.7826 0 42.7962 0H30.1063C27.1179 0 24.6257 2.053 24.0313 4.78967H22.5971C19.1656 4.78967 16.3828 7.49788 16.3828 10.8375V23.4384C16.3807 26.778 19.1634 29.4882 22.595 29.4882L22.5953 29.4883ZM36.449 8.31471C41.4535 8.31471 45.5123 12.2648 45.5123 17.1352C45.5123 22.0062 41.4535 25.9582 36.449 25.9582C31.4445 25.9582 27.3856 22.0081 27.3856 17.1377C27.3856 12.2673 31.4445 8.31471 36.449 8.31471ZM20.9092 9.32597H24.0182C24.9472 9.32597 25.7019 10.0584 25.7019 10.9625C25.7019 11.8686 24.9493 12.6011 24.0182 12.6011H20.9092C19.9823 12.6011 19.2254 11.8707 19.2254 10.9625C19.2275 10.0604 19.9822 9.32597 20.9092 9.32597Z" fill="rgb(var(--black))" fill-opacity="0.1"/>
      <path d="M58.8645 12.2878C58.8645 12.2878 77.1839 21.8549 65.5604 32.0445C63.6718 33.6967 55.2747 38.9138 42.5947 39.9368V45.0519C50.0424 44.2514 61.7635 41.887 68.4037 34.9253C82.5323 20.1097 58.8657 12.2871 58.8657 12.2871L58.8645 12.2878Z" fill="rgb(var(--black))" fill-opacity="0.1"/>
      <path d="M37.6664 41.209L29.1818 35.5097C28.077 34.7658 27.1702 35.2358 27.1702 36.5516V39.5855C16.2598 38.0408 9.07761 33.565 7.35125 32.0517C-4.2894 21.858 14.0557 12.2871 14.0557 12.2871C14.0557 12.2871 -9.64257 20.1134 4.5039 34.9343C10.2723 40.9769 19.8619 43.5552 27.1712 44.656V44.952V48.5701C27.1712 49.8901 28.078 50.3554 29.1827 49.6141L37.6673 43.9127C38.7757 43.1683 38.7757 41.9525 37.6673 41.2092L37.6664 41.209Z" fill="rgb(var(--black))" fill-opacity="0.1"/>
    </svg>


    <transition name="scale5" :css="!firstImageLoad" appear>
      <div v-if="currentImage" class="h-100 w-100 transition-ease">
        <img loading="lazy" v-if="currentImage" :key="currentImage" class="h-100 w-100 transition-ease" :src="(FILE_SERVER_URL || '') + currentImage.src" alt="360 product view" @mousedown="startRotation" @mousemove="rotate" @mouseup="stopRotation" @mouseleave="stopRotation" @touchstart="startRotation" @touchmove="rotate" @touchend="stopRotation" @dragstart.prevent>

      </div>
    </transition>
    <!-- Display the loading progress percentage next to the loader component -->
    <transition name="scale5">
      <Loader v-if="!currentImage" :progress="loadingProgress" class="center z-index-5"/>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue'

const props = defineProps({
  imagePath: {
    type: String,
    required: true,
  },
  imageCount: {
    type: Number,
    default: 36,
  },
  autoRotateSpeed: {
    type: Number,
    default: 100,
  },
});

const imageIndex = ref(0);
const isRotating = ref(false);
const startClientX = ref(0);

const loadedImages = ref(0);
const loaded = ref(true);

const loadImages = async () => {
  const images = [];

  for (let i = 1; i <= props.imageCount; i++) {
    const img = new Image();
    img.src = `${props.imagePath}/${i}.jpg`;

    try {
      await img.decode();
      // Increase the number of loaded images
      loadedImages.value++;
    } catch (error) {
      console.warn(`Failed to decode ${props.imagePath}/${i}.jpg:`, error);
    }

    images.push(img);
  }

  return images;
};

// Add a computed property to calculate the loading progress percentage
const loadingProgress = computed(() => {
  return Math.round((loadedImages.value / props.imageCount) * 100);
});

const images = ref([]);

const currentImage = ref('');
const firstImageLoad = ref(null);
watch(imageIndex, (index) => {
  currentImage.value = images.value[index] || '';
});

function startRotation(event) {
  isRotating.value = true;
  startClientX.value = event.clientX || event.touches[0].clientX;
}

function rotate(event) {
  if (!isRotating.value) return;

  const currentClientX = event.clientX || event.touches[0].clientX;
  const diff = currentClientX - startClientX.value;

  if (Math.abs(diff) >= 5) {
    const direction = diff > 0 ? 1 : -1;
    imageIndex.value = (imageIndex.value + direction) % props.imageCount;
    if (imageIndex.value < 0) imageIndex.value = props.imageCount - 1;

    startClientX.value = currentClientX;
  }
}

function stopRotation() {
  isRotating.value = false;
}

let autoRotateInterval = null;

const unloadImages = () => {
  images.value = [];
};



onMounted(async () => {
  images.value = await loadImages();
  currentImage.value = images.value[0] || ''; 
});
onUnmounted(() => {
  clearInterval(autoRotateInterval);
  unloadImages();
});
</script>


<style scoped>
  .expand-enter-active,
.expand-leave-active {
  transition: max-height 0.5s ease-in-out;
  overflow: hidden;
}
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.5s ease-in-out;
}
.scale5-enter-from,
.scale5-leave-to {
  transform: scale(1.2);
  opacity: 0;
}
.scale5-enter-to,
.scale5-leave-from {
  transform: scale(1);
  opacity: 1;
}

.product-360-viewer {
  user-select: none;
   min-height: 16rem;
}

.product-360-viewer img {
  max-width: 100%;
  cursor: grab;

  object-fit: cover;
  transition: all 0.3s ease;
}

.product-360-viewer img:active {
  cursor: grabbing;
}

/*.product-360-viewer img:hover {
  transform: scale(1.1);
}*/
</style>