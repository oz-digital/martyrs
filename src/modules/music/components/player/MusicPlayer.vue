<!-- components/player/MusicPlayer.vue -->
<template>
  <div class="music-player pd-small flex-between flex-v-center flex bg-dark br-t br-solid br-dark-transp-20 ">
    <!-- Current Track Info -->
    <div class="player-track-info flex-v-center flex w-25r">
      <div v-if="currentTrack" class="player-track-cover mn-r-small">
        <Media 
          :url="currentTrack.coverUrl || (currentTrack.album && currentTrack.album.coverUrl) || '/assets/placeholder-track.jpg'" 
          class="w-3r h-3r object-fit-cover radius-small"
        />
      </div>
      
      <div class="player-track-details t-truncate">
        <div class="player-track-title  t-medium t-truncate">
          {{ currentTrack?.title || 'No track playing' }}
        </div>
        <div class="player-track-artist t-grey t-small t-truncate">
          {{ getArtistName(currentTrack) }}
        </div>
      </div>
      
      <div class="player-favorite mn-l-small">
        <Button 
          @click="toggleFavorite" 
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconLike class="i-small" :fill="isFavorite ? 'rgb(var(--main))' : 'rgb(var(--grey))'"/>
        </Button>
      </div>
    </div>
    
    <!-- Player Controls -->
    <div class="player-controls flex-1 flex flex-column items-center">
      <div class="player-buttons flex-v-center flex gap-small">
        <Button 
          @click="toggleShuffle" 
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconShuffle class="i-small" :fill="shuffle ? 'rgb(var(--main))' : 'rgb(var(--grey))'"/>
        </Button>
        
        <Button 
          @click="playPrevious" 
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconPrevious class="i-small" fill="rgb(var(--white))"/>
        </Button>
        
        <Button 
          @click="togglePlay" 
          class="play-pause-btn bg-white radius-round pd-micro flex-center flex"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconPause v-if="isPlaying" class="i-medium" fill="rgb(var(--black))"/>
          <IconPlay v-else class="i-medium" fill="rgb(var(--black))"/>
        </Button>
        
        <Button 
          @click="playNext" 
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconNext class="i-small" fill="rgb(var(--white))"/>
        </Button>
        
        <Button 
          @click="toggleRepeat" 
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconRepeat class="i-small" :fill="repeatIcon"/>
        </Button>
      </div>
      
      <TrackProgress class="w-100 mn-t-thin" />
    </div>
    
    <!-- Volume Control -->
    <div class="player-volume flex-v-center flex w-15r">
      <Button 
        @click="toggleMute" 
        class="bg-transparent border-none pd-zero mn-r-small"
        :showLoader="false" 
        :showSucces="false"
      >
        <IconVolume v-if="!muted && volume > 0.5" class="i-small" fill="rgb(var(--white))"/>
        <IconVolumeHalf v-else-if="!muted && volume > 0" class="i-small" fill="rgb(var(--white))"/>
        <IconVolumeMute v-else class="i-small" fill="rgb(var(--white))"/>
      </Button>
      
      <VolumeControl />
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
// import IconVolumeHalf from '@martyrs/src/modules/icons/navigation/IconVolume.vue'; // Using same icon but we'd style it differently
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

const repeatIcon = computed(() => {
  switch(repeat.value) {
    case 'one':
      return 'rgb(var(--main))';
    case 'all':
      return 'rgb(var(--main))';
    default:
      return 'rgb(var(--grey))';
  }
});

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
.play-pause-btn {
  width: 32px;
  height: 32px;
  transition: transform 0.2s ease;
}

.play-pause-btn:hover {
  transform: scale(1.1);
}
</style>