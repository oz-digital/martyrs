<!-- components/lists/PlaylistList.vue -->
<template>
  <div class="playlist-list">
    <div v-if="playlists.length === 0" class="empty-list t-center pd-medium">
      <p class="t-grey">No playlists found</p>
    </div>
    
    <div v-else class="playlist-grid cols-5 mobile:cols-2 gap-small">
      <div v-for="playlist in playlists" :key="playlist._id">
        <PlaylistCard :playlist="playlist" class="hover-scale-1 transition-cubic-in-out" />
      </div>
    </div>
  </div>
</template>

<script setup>
import PlaylistCard from '../cards/PlaylistCard.vue';

const props = defineProps({
  playlists: {
    type: Array,
    required: true
  }
});
</script>