<template>
  <div 
    class="artist-card flex flex-column radius-medium o-hidden bg-white"
    :class="{ 'cursor-pointer hover-scale-1': clickable }"
    @click="handleClick"
  >
    <div class="artist-image w-100 pos-relative aspect-1x1">
      <img 
        v-if="artist.photo" 
        :src="FILE_SERVER_URL + artist.photo" 
        :alt="artist.name"
        class="w-100 h-100 object-fit-cover"
        loading="lazy"
      />
      <div v-else class="w-100 h-100 bg-light flex-center flex">
        <span class="h3">{{ artist.name ? artist.name.charAt(0) : '?' }}</span>
      </div>
      
      <div 
        v-if="showStatus" 
        class="pos-absolute pos-t-small pos-r-small pd-micro radius-medium"
        :class="{
          'bg-second': artist.status === 'published',
          'bg-fifth': artist.status === 'featured',
          'bg-grey': artist.status === 'draft'
        }"
      >
        <span class="t-white p-small">{{ artist.status }}</span>
      </div>
    </div>
    
    <div class="pd-small">
      <h4 class="mn-b-micro t-trim-2">{{ artist.name }}</h4>
      <p v-if="artist.genres && artist.genres.length" class="p-small t-transp t-trim">
        {{ artist.genres.join(', ') }}
      </p>
    </div>
    
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  artist: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: true
  },
  showStatus: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const handleClick = () => {
  if (!props.clickable) return;
  
  router.push({
    name: 'artist-detail',
    params: { url: props.artist.url }
  });
};
</script>

<style scoped>
.artist-card {
  border: 1px solid rgba(var(--grey), 0.2);
  transition: transform 0.2s ease;
}

.hover-scale-1:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>