<template>
  <div class="w-100 bs-heavy h-max  mobile:pos-relative tablet:pos-relative pos-sticky pos-t-0 pd-medium o-hidden bg-light radius-medium gap-small flex-nowrap flex-row mobile:flex-column flex pos-relative">
    <!-- Main image container -->
    <div class="order-1 w-100 bg-light radius-small o-hidden" @click="openPopup(currentImageIndex)">
      <Image360
        v-if="product && product.image3d"
        class="h-100 w-100"
        :imagePath="`/assets/images/products/${product.image3d}`"
        :imageCount="36"
      />
      <img
        loading="lazy"
        v-if="images[currentImageIndex] && !product?.image3d"
        class="h-100 flex-child-default bg-white radius-small w-100"
        style="object-fit: contain;"
        :src="(FILE_SERVER_URL || '') + images[currentImageIndex]"
      />
      <PlaceholderImage
        v-if="!images[currentImageIndex] && !product?.image3d"
        class="h-100 w-100"
        style="object-fit: cover;"
      />
    </div>
    
    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="mobile:order-1 order-0 w-5r mobile:w-100">
      <div class="w-100 mobile:flex-row flex-column flex flex-nowrap gap-thin">
        <img loading="lazy" 
          v-for="(image, index) in images.slice(0, 5)"
          :key="index"
          :src="(FILE_SERVER_URL || '') + image" 
          @click="currentImageIndex = index"
          class="aspect-1x1 radius-small bg-white o-hidden thumbnail"
          :class="{ 'active': currentImageIndex === index }"
        />
        <div
          v-if="images.length > 5"
          @click="openPopup(5)"
          class="aspect-1x1 radius-small o-hidden thumbnail flex flex-center t-medium t-black bg-white "
        >
          +{{ images.length - 5 }}
        </div>
      </div>
    </div>
    
    <!-- Popup with photo viewer -->
    <Popup @close-popup="closePopup" :isPopupOpen="isPopupVisible" class="radius-zero o-hidden">
      <PhotoViewer
        :photos="images.map(img => (FILE_SERVER_URL || '') + img)"
        :initialIndex="selectedImageIndex"
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
const selectedImageIndex = ref(0);
const currentImageIndex = ref(0);

const openPopup = (index) => {
  if (!props.images.length) return;
  selectedImageIndex.value = index;
  isPopupVisible.value = true;
};

const closePopup = () => {
  selectedImageIndex.value = 0;
  isPopupVisible.value = false;
};
</script>

<style scoped>
.thumbnail {
  width: 100%;
  object-fit: cover;
  cursor: pointer;
}
.thumbnail.active {
  border: 1px solid rgb(var(--second));
}
</style>