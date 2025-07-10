<!-- components/cards/AlbumCard.vue -->
<template>
  <router-link 
    :to="{ name: 'album', params: { url: album.url } }" 
    class="album-card d-block radius-medium o-hidden"
  >
    <div class="album-cover pos-relative">
      <Media 
        :url="album.coverArt || album.coverUrl || '/logo/logo-placeholder.jpg'" 
        class="w-100 aspect-1x1 object-fit-cover"
      />
      <div v-if="album.totalTracks && album.totalTracks > 0" class="album-overlay pos-absolute pos-t-0 pos-l-0 w-100 h-100 flex-center flex transition-cubic-in-out">
        <Button 
          @click.stop.prevent="playAlbum(album)" 
          class="play-button i-big bg-main radius-round flex-center flex aspect-1x1"
          :showLoader="false"
          :showSucces="false"
        >
          <IconPlay class="i-small" fill="rgb(var(--white))" />
        </Button>
      </div>
    </div>
    <div class="album-info pd-medium bg-light">
      <h3 class="mn-b-thin t-medium t-truncate">{{ album.title }}</h3>
      <p class="t-transp t-small t-truncate">{{ albumInfo }}</p>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';

// Import player store & albums store
import { actions as playerActions } from '../../store/player.js';
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';

const props = defineProps({
  album: {
    type: Object,
    required: true
  }
});

// Computed properties
const albumInfo = computed(() => {
  const releaseYear = props.album.releaseDate ? new Date(props.album.releaseDate).getFullYear() : '';
  let artistName = 'Unknown Artist';
  
  // Handle artists array (model uses 'artists' not 'artist')
  if (props.album.artists && props.album.artists.length > 0) {
    // If populated, artists[0] will have name property
    if (props.album.artists[0]?.name) {
      artistName = props.album.artists.map(artist => artist.name).join(', ');
    } else if (typeof props.album.artists[0] === 'string') {
      // If not populated, it might be just IDs
      artistName = 'Various Artists';
    }
  } else if (props.album.artist?.name) {
    // Fallback for old data structure
    artistName = props.album.artist.name;
  }
  
  return releaseYear ? `${artistName} • ${releaseYear}` : artistName;
});

// Methods
const playAlbum = async (album) => {
  // If album tracks are already loaded in state, use those
  if (albumsState.currentAlbum && albumsState.currentAlbum._id === album._id && albumsState.currentAlbumTracks.length > 0) {
    playerActions.setQueue(albumsState.currentAlbumTracks);
    return;
  }
  
  // Otherwise fetch tracks for this album
  const tracks = await albumsActions.fetchAlbumTracks(album._id);
  
  if (tracks && tracks.length > 0) {
    playerActions.setQueue(tracks);
  }
};
</script>

<style scoped>
.album-card {
  transition: transform 0.3s ease;
}

.album-card:hover {
  transform: translateY(-5px);
}

.album-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.play-button {
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.album-card:hover .play-button {
  transform: scale(1);
}
</style>