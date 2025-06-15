<!-- components/cards/TrackCard.vue -->
<template>
  <div 
    class="track-card radius-small o-hidden pos-relative cursor-pointer transition-cubic-in-out bg-dark-transp-20"
    @click="playTrack"
  >
    <div class="track-card-content pd-small flex-v-center flex">
      <div class="track-cover mn-r-small">
        <Media 
          :url="track.coverUrl || (track.album && track.album.coverUrl) || '/assets/placeholder-track.jpg'" 
          class="w-3r h-3r object-fit-cover radius-small"
        />
      </div>
      
      <div class="track-info flex-1">
        <div class="track-name t-white t-truncate">{{ track.title }}</div>
        <div class="track-artist t-grey t-small t-truncate">{{ getArtistName(track) }}</div>
      </div>
      
      <div class="track-play pos-absolute pos-r-0 pos-t-0 h-100 pd-small flex-center flex">
        <div class="play-button bg-main radius-round flex-center flex aspect-1x1 i-medium">
          <IconPlay class="i-small" fill="rgb(var(--black))"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';

// Import player store
import { actions as playerActions } from '../../store/player.js';

const props = defineProps({
  track: {
    type: Object,
    required: true
  }
});

// Methods
const getArtistName = (track) => {
  if (track.artist) {
    if (typeof track.artist === 'object') {
      return track.artist.name || 'Unknown Artist';
    }
    return track.artist;
  }
  return 'Unknown Artist';
};

const playTrack = () => {
  playerActions.playTrack(props.track);
};
</script>

<style scoped>
.track-card {
  transition: background-color 0.3s ease;
}

.track-card:hover {
  background-color: rgba(var(--dark), 0.4);
}

.track-play {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.track-card:hover .track-play {
  opacity: 1;
}

.play-button {
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.track-card:hover .play-button {
  transform: scale(1);
}
</style>