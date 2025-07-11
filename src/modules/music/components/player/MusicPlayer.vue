<!-- components/player/MusicPlayer.vue -->
<template>
  <div class="player-container">
    <div class="player">
      <!-- Track Info Section -->
      <div class="track-info">
        <div class="track-image">
          <Media 
            :url="currentTrack?.coverUrl || (currentTrack?.album && currentTrack.album.coverUrl) || '/assets/placeholder-track.jpg'" 
            class="track-image-media"
          />
        </div>
        <div class="track-details">
          <h3 class="track-title">{{ currentTrack?.title || 'No track playing' }}</h3>
          <p class="track-artist">{{ getArtistName(currentTrack) }}</p>
        </div>
        <Button 
          @click="toggleFavorite" 
          class="like-btn"
          :class="{ liked: isFavorite }"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconLike class="like-icon"/>
        </Button>
      </div>

      <!-- Control Section -->
      <div class="controls">
        <div class="control-buttons">
          <Button 
            @click="toggleShuffle" 
            class="control-btn secondary"
            :class="{ active: shuffle }"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconShuffle fill="rgb(var(--black))" class="control-icon"/>
          </Button>
          
          <Button 
            @click="playPrevious" 
            class="control-btn secondary"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconPrevious fill="rgb(var(--black))" class="control-icon"/>
          </Button>
          
          <Button 
            @click="togglePlay" 
            class="control-btn primary"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconPause v-if="isPlaying" fill="white" class="play-icon"/>
            <IconPlay fill="white"  v-else class="play-icon"/>
          </Button>
          
          <Button 
            @click="playNext" 
            class="control-btn secondary"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconNext fill="rgb(var(--black))" class="control-icon"/>
          </Button>
          
          <Button 
            @click="toggleRepeat" 
            class="control-btn secondary"
            :class="{ active: repeat !== 'off' }"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconRepeat fill="rgb(var(--black))" class="control-icon"/>
          </Button>
        </div>
        
        <!-- Progress Bar -->
        <div class="progress-section">
          <TrackProgress />
        </div>
      </div>

      <!-- Volume Section -->
      <div class="volume-section">
        <Button 
          @click="toggleMute" 
          class="volume-btn"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconVolumeMute fill="rgb(var(--black))" v-if="muted || volume < 0.005" class="volume-icon"/>
          <!-- <IconVolumeHalf fill="rgb(var(--black))" v-else-if="!muted && volume > 0" class="volume-icon"/> -->
          <IconUnMute  fill="rgb(var(--black))" v-else class="volume-icon"/>
        </Button>
        
        <div class="volume-slider">
          <VolumeControl />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import TrackProgress from './TrackProgress.vue';
import VolumeControl from './VolumeControl.vue';

// Import icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconPause from '@martyrs/src/modules/icons/navigation/IconPause.vue';
import IconNext from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';
import IconPrevious from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue';
import IconShuffle from '@martyrs/src/modules/icons/navigation/IconShuffle.vue';
import IconRepeat from '@martyrs/src/modules/icons/navigation/IconRefresh.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconVolume from '@martyrs/src/modules/icons/navigation/IconVolume.vue';
import IconUnMute from '@martyrs/src/modules/icons/navigation/IconUnMute.vue';
import IconVolumeHalf from '@martyrs/src/modules/icons/navigation/IconVolume.vue';
import IconVolumeMute from '@martyrs/src/modules/icons/navigation/IconMute.vue';

// Import player store
import { state as playerState, actions as playerActions } from '../../store/player.js';

// State
const isFavorite = ref(false);

// Computed properties
const currentTrack = computed(() => playerState.currentTrack);
const isPlaying = computed(() => playerState.isPlaying);
const volume = computed(() => playerState.volume);
const muted = computed(() => playerState.muted);
const shuffle = computed(() => playerState.shuffle);
const repeat = computed(() => playerState.repeat);

// Methods
const togglePlay = () => {
  playerActions.togglePlay();
};

const playNext = () => {
  playerActions.playNext();
};

const playPrevious = () => {
  playerActions.playPrevious();
};

const toggleShuffle = () => {
  playerActions.toggleShuffle();
};

const toggleRepeat = () => {
  playerActions.toggleRepeat();
};

const toggleMute = () => {
  playerActions.toggleMute();
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Implement favorite track logic here
};

const getArtistName = (track) => {
  if (!track) return 'Unknown Artist';
  
  if (track.artist) {
    if (typeof track.artist === 'object') {
      return track.artist.name || 'Unknown Artist';
    }
    return track.artist;
  }
  return 'Unknown Artist';
};
</script>

<style scoped>
.player-container {
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, rgb(var(--white)) 0%, rgb(var(--light)));
  border-top: 1px solid rgb(var(--light));
  backdrop-filter: blur(10px);
}

.player {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  height: 90px;
  max-width: 100%;
}

/* Track Info Section */
.track-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.track-image {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.track-image-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.track-image:hover .track-image-media {
  transform: scale(1.05);
}

.track-details {
  min-width: 0;
  flex: 1;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--black));
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.track-artist {
  font-size: 12px;
  color: rgb(var(--grey));
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-btn {
  background: none;
  border: none;
  color: rgb(var(--grey));
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-icon {
  width: 16px;
  height: 16px;
}

.like-btn:hover {
  color: rgb(var(--black));
  background: rgba(var(--black),0.1);
}

.like-btn.liked {
  color: rgb(var(--main));
}

.like-btn.liked .like-icon {
  fill: rgb(var(--main));
}

.like-btn.liked:hover {
  color: rgb(var(--main));
  opacity: 0.8;
}

/* Controls Section */
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: rgb(var(--grey));
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-icon {
  width: 16px;
  height: 16px;
}

.control-btn.primary {
  background: rgb(var(--second));
  color: rgb(var(--white));
  width: 32px;
  height: 32px;
}

.play-icon {
  width: 14px;
  height: 14px;
  fill: rgb(var(--white));
}

.control-btn.primary:hover {
  background: rgb(var(--second));
  transform: scale(1.06);
}

.control-btn.secondary:hover {
  color: rgb(var(--white));
  background: rgba(var(--black),0.1);
}

.control-btn.secondary:hover .control-icon {
  fill: rgb(var(--white));
}

.control-btn.active {
  color: rgb(var(--main));
  background: rgba(var(--second),0.1);
}

.control-btn.active .control-icon {
  fill: rgb(var(--main));
}

.control-btn.active:hover {
  color: rgb(var(--main));
  opacity: 0.8;
   background: rgba(var(--second),0.2);
}

/* Progress Section */
.progress-section {
  width: 100%;
  max-width: 600px;
}

/* Volume Section */
.volume-section {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.volume-btn {
  background: none;
  border: none;
  color: rgb(var(--grey));
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-icon {
  width: 16px;
  height: 16px;
}

.volume-btn:hover {
  color: rgb(var(--white));
  background: rgba(var(--white),0.1);
}

.volume-btn:hover .volume-icon {
  fill: rgb(var(--white));
}

.volume-slider {
  width: 100px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .player {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
    padding: 8px 12px 12px;
    gap: 12px;
  }

  .track-info {
    order: 1;
  }

  .controls {
    order: 2;
  }

  .volume-section {
    order: 3;
    justify-content: center;
  }

  .volume-slider {
    width: 120px;
  }

  .progress-section {
    max-width: 100%;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.player-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.control-btn.primary:active {
  animation: pulse 0.3s ease;
}
</style>