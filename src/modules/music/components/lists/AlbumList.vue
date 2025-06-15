<!-- components/lists/AlbumList.vue -->
<template>
  <div class="album-list">
    <div v-if="albums.length === 0" class="empty-list t-center pd-medium">
      <p class="t-grey">No albums found</p>
    </div>
    
    <div v-else class="album-grid cols-5 mobile:cols-2 gap-small">
      <div v-for="album in albums" :key="album._id">
        <AlbumCard :album="album" class="hover-scale-1 transition-cubic-in-out" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AlbumCard from '../cards/AlbumCard.vue';

const props = defineProps({
  albums: {
    type: Array,
    required: true
  }
});
</script>