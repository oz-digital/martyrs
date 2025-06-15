<!-- components/player/TrackProgress.vue -->
<template>
  <div class="track-progress flex flex-v-center gap-small">
    <div class="current-time t-grey t-small">{{ formatTime(currentTime) }}</div>
    
    <div 
      ref="progressBarContainer"
      class="progress-bar-container flex-1 h-thin bg-grey radius-extra pos-relative cursor-pointer"
      @click="seek"
      @mousedown="startSeek"
      @mousemove="updateSeekPosition"
      @mouseup="endSeek"
      @mouseleave="endSeek"
    >
      <div 
        class="progress-bar h-100 bg-white radius-extra" 
        :style="{ width: progressPercentage + '%' }"
      ></div>
      <div 
        class="progress-handle w-thin h-thin bg-white radius-round pos-absolute pos-t-50 pos-l-0"
        :style="{ left: `calc(${progressPercentage}% - 4px)`, transform: 'translateY(-50%)' }"
      ></div>
    </div>
    
    <div class="total-time t-grey t-small">{{ formatTime(duration) }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Import player store
import { state as playerState, actions as playerActions } from '../../store/player.js';

// Refs
const progressBarContainer = ref(null);
const isSeeking = ref(false);
const seekPosition = ref(0);

// Computed properties
const currentTime = computed(() => playerState.currentTime);
const duration = computed(() => playerState.duration);
const progressPercentage = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, (currentTime.value / duration.value) * 100);
});

// Methods
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const calculateSeekTime = (event) => {
  if (!progressBarContainer.value || !duration.value) return 0;
  
  const rect = progressBarContainer.value.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
  
  return percentage * duration.value;
};

const seek = (event) => {
  const seekTime = calculateSeekTime(event);
  playerActions.seek(seekTime);
};

const startSeek = (event) => {
  isSeeking.value = true;
  seekPosition.value = calculateSeekTime(event);
};

const updateSeekPosition = (event) => {
  if (isSeeking.value) {
    seekPosition.value = calculateSeekTime(event);
  }
};

const endSeek = () => {
  if (isSeeking.value) {
    isSeeking.value = false;
    playerActions.seek(seekPosition.value);
  }
};

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  isSeeking.value = false;
});
</script>

<style scoped>
.progress-bar-container:hover .progress-bar {
  background-color: rgb(var(--main));
}

.progress-handle {
  display: none;
}

.progress-bar-container:hover .progress-handle {
  display: block;
  transform: translateY(-50%) scale(1.3);
}
</style>