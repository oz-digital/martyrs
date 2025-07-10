<!-- components/layouts/MusicBottomPlayer.vue -->
<template>
  <MusicPlayer v-if="currentTrack" class="pos-absolute pos-b-0 w-100" />
</template>

<script setup>
import { computed } from 'vue';
import MusicPlayer from '../player/MusicPlayer.vue';

// Import store modules
import { state as playerState } from '../../store/player.js';

// Current track from player store
const currentTrack = computed(() => {
  return playerState.currentTrack;
});
</script>