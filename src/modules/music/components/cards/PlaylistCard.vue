<!-- components/cards/PlaylistCard.vue -->
<template>
  <router-link 
    :to="{ name: 'playlist', params: { url: playlist.url } }" 
    class="playlist-card d-block radius-small o-hidden"
  >
    <div class="playlist-cover pos-relative">
      <Media 
        :url="playlist.coverUrl || '/assets/placeholder-playlist.jpg'" 
        class="w-100 aspect-1x1 object-fit-cover"
      />
      <div class="playlist-overlay pos-absolute pos-t-0 pos-l-0 w-100 h-100 flex-center flex transition-cubic-in-out">
        <Button 
          @click.stop="playPlaylist(playlist)" 
          class="play-button bg-main radius-round flex-center flex aspect-1x1"
          :showLoader="false"
          :showSucces="false"
        >
          <IconPlay class="i-small" fill="rgb(var(--black))" />
        </Button>
      </div>
    </div>
    <div class="playlist-info pd-small bg-dark-transp-20">
      <h3 class=" t-medium t-truncate">{{ playlist.title }}</h3>
      <p class="t-grey t-small t-truncate">{{ playlistInfo }}</p>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';

// Import player store
import { actions as playerActions } from '../../store/player.js';

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
});

// Computed properties
const playlistInfo = computed(() => {
  const trackCount = props.playlist.tracks?.length || 0;
  let creatorName = 'Unknown';
  
  if (props.playlist.creator?.target?.profile?.name) {
    creatorName = props.playlist.creator.target.profile.name;
  } else if (props.playlist.creator?.target?.name) {
    creatorName = props.playlist.creator.target.name;
  }
  
  return `${creatorName} • ${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}`;
});

// Methods
const playPlaylist = (playlist) => {
  // Extract tracks from playlist
  const tracks = playlist.tracks?.map(item => item.track).filter(track => track) || [];
  
  if (tracks.length > 0) {
    playerActions.setQueue(tracks);
  }
};
</script>

<style scoped>
.playlist-card {
  transition: transform 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-5px);
}

.playlist-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.play-button {
  width: 48px;
  height: 48px;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.playlist-card:hover .play-button {
  transform: scale(1);
}
</style>