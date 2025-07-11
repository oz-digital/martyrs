<!-- components/player/VolumeControl.vue -->
<template>
  <div class="volume-control">
    <div 
      ref="volumeBarContainer"
      class="volume-bar-container"
      @click="setVolume"
      @mousedown="startVolumeChange"
      @mousemove="updateVolumePosition"
      @mouseup="endVolumeChange"
      @mouseleave="endVolumeChange"
    >
      <div 
        class="volume-track"
        :style="{ 
          background: `linear-gradient(to right, rgb(var(--black)) 0%, rgb(var(--black)) ${volumePercentage}%, rgb(var(--grey)) ${volumePercentage}%, rgb(var(--grey)) 100%)`
        }"
      >
        <div 
          class="volume-thumb"
          :style="{ 
            left: `${volumePercentage}%`,
            opacity: muted ? 0 : 1
          }"
        ></div>
      </div>
    </div>
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
.volume-control {
  width: 100%;
}

.volume-bar-container {
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
}

.volume-track {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  transition: height 0.2s ease;
}

.volume-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
   background: rgb(var(--black));
  border: 1px solid rgba(var(--white),0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s ease;
  opacity: 0;
}

.volume-bar-container:hover .volume-track {
  height: 6px;
}

.volume-bar-container:hover .volume-thumb {
  opacity: 1 !important;
}

/* Muted state */
.volume-track.muted {
  opacity: 0.5;
}
</style>