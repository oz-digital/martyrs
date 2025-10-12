<script setup>
import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'

defineProps({
  number: {
    type: Number,
    required: true
  },
  photos: {
    type: Array,
    required: true
  },
})
</script>

<template>
  <div v-if="number" class="w-4r pos-relative i-medium">
    <span 
      :style="{ 
        position: 'absolute', 
        top: '0px', 
        right: '0px' 
      }"
      class="br-solid br-2px br-white z-index-1 radius-big i-medium bg-second flex flex-center t-white p-small t-semi"
    >
      {{number}}
    </span>
    
    <template v-if="photos.length > 0 " v-for="(photo, index) in photos.slice(0,2)">
      <img
        v-if="photo"
        loading="lazy"
        :key="index"
        :src="(FILE_SERVER_URL || '') + photo"
        :style="{ 
          position: 'absolute', 
          top: '0px', 
          right: (index * 20 + 20) + '%', 
          zIndex: 1 - index 
        }"
        class="br-solid br-2px br-white i-medium bg-light radius-big"
      />

      <PlaceholderUserpic
        v-else
        :style="{ 
          position: 'absolute', 
          top: '0px', 
          right: (index * 20 + 20) + '%', 
          zIndex: 1 - index 
        }"
        class="br-solid br-2px br-white i-medium bg-light radius-big"
      />
    </template>
  </div>
</template>