<!-- components/player/TrackProgress.vue -->
<template>
  <div class="progress-section">
    <span class="time-current">{{ formatTime(currentTime) }}</span>
    <div 
      ref="progressBarContainer"
      class="progress-bar"
      @click="seek"
      @mousedown="startSeek"
      @mousemove="updateSeekPosition"
      @mouseup="endSeek"
      @mouseleave="endSeek"
    >
      <div class="progress-track">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
        <div 
          class="progress-thumb"
          :style="{ left: progressPercentage + '%' }"
        ></div>
      </div>
    </div>
    <span class="time-total">{{ formatTime(duration) }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

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
/* Progress Section */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.time-current,
.time-total {
  font-size: 11px;
  color: rgb(var(--grey));
  font-weight: 400;
  min-width: 32px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgb(79, 79, 79);
  border-radius: 2px;
  overflow: hidden;
  transition: height 0.2s ease;
}

.progress-fill {
  height: 100%;
  background: rgb(var(--white));
  border-radius: 2px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: rgb(var(--white));
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.progress-bar:hover .progress-track {
  height: 6px;
}

.progress-bar:hover .progress-fill {
  background: rgb(var(--main));
}
</style>