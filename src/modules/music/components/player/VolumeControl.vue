<!-- components/player/VolumeControl.vue -->
<template>
  <div 
    ref="volumeBarContainer"
    class="volume-bar-container w-100 h-thin bg-grey-transp-50 radius-extra pos-relative cursor-pointer"
    @click="setVolume"
    @mousedown="startVolumeChange"
    @mousemove="updateVolumePosition"
    @mouseup="endVolumeChange"
    @mouseleave="endVolumeChange"
  >
    <div 
      class="volume-bar h-100 bg-white radius-extra" 
      :style="{ width: volumePercentage + '%' }"
      :class="{ 'muted': muted }"
    ></div>
    <div 
      class="volume-handle w-thin h-thin bg-white radius-round pos-absolute pos-t-50 pos-l-0"
      :style="{ 
        left: `calc(${volumePercentage}% - 4px)`, 
        transform: 'translateY(-50%)',
        opacity: muted ? 0 : 1
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Import player store
import { state as playerState, actions as playerActions } from '../../store/player.js';

// Refs
const volumeBarContainer = ref(null);
const isChangingVolume = ref(false);

// Computed properties
const volume = computed(() => playerState.volume);
const muted = computed(() => playerState.muted);
const volumePercentage = computed(() => {
  if (muted.value) return 0;
  return volume.value * 100;
});

// Methods
const calculateVolume = (event) => {
  if (!volumeBarContainer.value) return 0;
  
  const rect = volumeBarContainer.value.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  
  return Math.max(0, Math.min(1, offsetX / rect.width));
};

const setVolume = (event) => {
  const newVolume = calculateVolume(event);
  playerActions.setVolume(newVolume);
  
  // Unmute if was muted
  if (muted.value && newVolume > 0) {
    playerActions.toggleMute();
  }
};

const startVolumeChange = (event) => {
  isChangingVolume.value = true;
  setVolume(event);
};

const updateVolumePosition = (event) => {
  if (isChangingVolume.value) {
    setVolume(event);
  }
};

const endVolumeChange = () => {
  isChangingVolume.value = false;
};
</script>

<style scoped>
.volume-bar-container:hover .volume-bar:not(.muted) {
  background-color: rgb(var(--main));
}

.volume-handle {
  display: none;
}

.volume-bar-container:hover .volume-handle {
  display: block;
}

.muted {
  opacity: 0.5;
}
</style>