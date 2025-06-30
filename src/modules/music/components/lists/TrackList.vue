<!-- components/lists/TrackList.vue (continued) -->
<template>
  <div class="track-list w-100">
    <div 
      v-if="showHeader" 
      class="track-list-header pd-small br-b br-solid br-dark-transp-20 t-grey flex-v-center flex"
    >
      <div class="track-number w-3r t-center">#</div>
      <div class="track-title flex-child-1">TITLE</div>
      <div v-if="showAlbum" class="track-album w-15r mobile:w-0 mobile:hidden">ALBUM</div>
      <div class="track-duration w-5r t-right">DURATION</div>
    </div>
    
    <div class="track-list-body">
      <div 
        v-for="(track, index) in tracks" 
        :key="track._id"
        class="track-item pd-small hover-bg-dark-transp-25 flex-v-center flex cursor-pointer"
        :class="{'bg-dark-transp-25': isPlaying(track)}"
        @click="playTrack(track)"
        @dblclick="playTrack(track, true)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = -1"
      >
        <div class="track-number w-3r t-center pos-relative">
          <span v-if="!isPlaying(track) && hoveredIndex !== index" class="t-grey">{{ index + 1 }}</span>
          <Button 
            v-else-if="!isPlaying(track) && hoveredIndex === index"
            @click.stop="playTrack(track)"
            class="bg-transparent border-none pd-zero"
            :showLoader="false"
            :showSucces="false"
          >
            <IconPlay class="i-small" fill="rgb(var(--white))"/>
          </Button>
          <Button 
            v-else
            @click.stop="pauseTrack()"
            class="bg-transparent border-none pd-zero"
            :showLoader="false"
            :showSucces="false"
          >
            <IconPause class="i-small" fill="rgb(var(--main))"/>
          </Button>
        </div>
        
        <div class="track-title flex-child-1 flex flex-v-center">
          <div v-if="showCover" class="track-cover mn-r-small">
            <Media 
              :url="track.coverUrl || (track.album && track.album.coverUrl) || '/assets/placeholder-track.jpg'" 
              class="w-3r h-3r object-fit-cover o-hidden radius-small"
            />
          </div>
          
          <div class="track-info">
            <div class="track-name " :class="{'t-main': isPlaying(track)}">{{ track.title }}</div>
            <div class="track-artist t-grey t-small">
              <router-link 
                v-if="track.artist && track.artist._id"
                :to="{ name: 'artist-detail', params: { url: track.artist.url } }"
                class="t-grey hover-"
                @click.stop
              >
                {{ getArtistName(track) }}
              </router-link>
              <span v-else>{{ getArtistName(track) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="showAlbum" class="track-album w-15r mobile:w-0 mobile:hidden t-grey t-truncate">
          <router-link 
            v-if="track.album && track.album._id"
            :to="{ name: 'album-detail', params: { url: track.album.url } }"
            class="t-grey hover-"
            @click.stop
          >
            {{ track.album.title }}
          </router-link>
          <span v-else>{{ track.album?.title || 'Single' }}</span>
        </div>
        
        <div class="track-duration w-5r t-right t-grey">{{ formatDuration(track.duration) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconPause from '@martyrs/src/modules/icons/navigation/IconPause.vue';

// Import player store
import { state as playerState, actions as playerActions } from '../../store/player.js';

const props = defineProps({
  tracks: {
    type: Array,
    required: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showAlbum: {
    type: Boolean,
    default: false
  },
  showCover: {
    type: Boolean,
    default: false
  },
  showIndex: {
    type: Boolean,
    default: true
  }
});

// State
const hoveredIndex = ref(-1);

// Computed
const currentTrack = computed(() => playerState.currentTrack);

// Methods
const isPlaying = (track) => {
  return currentTrack.value && currentTrack.value._id === track._id && isPlaying.value;
};

const isHovering = (index) => {
  return hoveredIndex.value === index;
};

const playTrack = (track, addToQueue = false) => {
  if (addToQueue) {
    playerActions.addToQueue(track);
  } else {
    // Find track index to set queue properly
    const trackIndex = props.tracks.findIndex(t => t._id === track._id);
    playerActions.setQueue([...props.tracks], trackIndex);
  }
};

const pauseTrack = () => {
  playerActions.togglePlay();
};

const getArtistName = (track) => {
  if (track.artist) {
    if (typeof track.artist === 'object') {
      return track.artist.name || 'Unknown Artist';
    }
    return track.artist;
  }
  return 'Unknown Artist';
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.track-item {
  transition: background-color 0.2s ease;
}
</style>