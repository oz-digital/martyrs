<template>
  <div class="w-100 o-hidden bg-light radius-medium flex-nowrap flex-column flex pos-relative">
    <!-- Main image container -->
    <div class="pd-semi w-100 bg-light radius-semi o-hidden" @click="openPopup(images[0])">
      <Image360
        v-if="product && product.image3d"
        class="h-100 w-100"
        :imagePath="`/assets/images/products/${product.image3d}`"
        :imageCount="36"
      />
      <img
        loading="lazy"
        v-if="images[0] && !product?.image3d"
        class="h-max h-max-15r bg-white radius-semi w-100"
        style="object-fit: contain;"
        :src="(FILE_SERVER_URL || '') + images[0]"
      />
      <PlaceholderImage
        v-if="!images[0] && !product?.image3d"
        class="h-max-20r h-100 w-100"
        style="object-fit: cover;"
      />
    </div>
    
    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="o-scroll w-100 pd-semi pd-t-zero">
      <div class="no-responsive w-max flex flex-nowrap gap-thin">
        <img loading="lazy" 
          v-for="(image, index) in images"
          :key="index"
          :src="(FILE_SERVER_URL || '') + image" 
          @click="openPopup(image)"
          class="flex-child flex-child-grow-1 aspect-1x1 radius-semi bg-white o-hidden thumbnail"
        />
      </div>
    </div>
    
    <!-- Popup with photo viewer -->
    <Popup @close-popup="closePopup" :isPopupOpen="isPopupVisible" class="radius-medium o-hidden">
      <PhotoViewer
        :photoUrl="(FILE_SERVER_URL || '') + selectedImage"
      />
    </Popup>
  </div>
</template>

<script setup>
import { ref } from "vue";

import Popup from '@martyrs/src/components/Popup/Popup.vue';
import PhotoViewer from '@martyrs/src/components/PhotoViewer/PhotoViewer.vue';

import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'

import Image360 from '@martyrs/src/modules/products/components/elements/Image360.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  product: {
    type: Object,
    default: () => ({})
  },
});

const isPopupVisible = ref(false);
const selectedImage = ref(null);

const openPopup = (image) => {
  if (!image) return;
  selectedImage.value = image;
  isPopupVisible.value = true;
};

const closePopup = () => {
  isPopupVisible.value = false;
};
</script>

<style scoped>
.thumbnail {
  width: 100%;
  max-width: 6rem;
  height: 6rem;
  object-fit: cover;
  cursor: pointer;
}
</style>