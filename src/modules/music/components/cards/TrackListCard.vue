<!-- components/cards/TrackListCard.vue -->
<template>
  <div 
    class="track-item pd-small hover-bg-dark-transp-25 flex-v-center flex cursor-pointer"
    :class="{'bg-dark-transp-25': isPlaying(track)}"
    @click="playTrack(track)"
    @dblclick="playTrack(track, true)"
    @mouseenter="hoveredIndex = props.index"
    @mouseleave="hoveredIndex = -1"
  >
    <div class="track-number w-3r t-center pos-relative">
      <span v-if="!isPlaying(track) && hoveredIndex !== props.index" class="t-grey">{{ props.index + 1 }}</span>
      <Button 
        v-else-if="!isPlaying(track) && hoveredIndex === props.index"
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
            :to="{ name: 'artist', params: { url: track.artist.url } }"
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
        :to="{ name: 'album', params: { url: track.album.url } }"
        class="t-grey hover-"
        @click.stop
      >
        {{ track.album.title }}
      </router-link>
      <span v-else>{{ track.album?.title || 'Single' }}</span>
    </div>
    
    <div class="track-duration w-5r t-right t-grey">{{ formatDuration(track.duration) }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconPause from '@martyrs/src/modules/icons/navigation/IconPause.vue';

// Import player store
import { state as playerState, actions as playerActions } from '../../store/player.js';

// Props
const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  showCover: {
    type: Boolean,
    default: true
  },
  showAlbum: {
    type: Boolean,
    default: true
  }
});

// State
const hoveredIndex = ref(-1);

// Methods
const isPlaying = (track) => {
  return playerState.currentTrack && playerState.currentTrack._id === track._id && playerState.isPlaying;
};

const playTrack = (track, force = false) => {
  if (isPlaying(track) && !force) {
    playerActions.togglePlay();
  } else {
    playerActions.playTrack(track);
  }
};

const pauseTrack = () => {
  playerActions.pause();
};

const getArtistName = (track) => {
  if (!track || !track.artist) return 'Unknown Artist';
  return typeof track.artist === 'object' ? track.artist.name : 'Unknown Artist';
};

const formatDuration = (duration) => {
  if (!duration) return '--:--';
  
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
</script>