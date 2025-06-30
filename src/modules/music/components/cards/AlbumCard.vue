<!-- components/cards/AlbumCard.vue -->
<template>
  <router-link 
    :to="{ name: 'album-detail', params: { url: album.url } }" 
    class="album-card d-block radius-small o-hidden"
  >
    <div class="album-cover pos-relative">
      <Media 
        :url="album.coverUrl || '/assets/placeholder-album.jpg'" 
        class="w-100 aspect-1x1 object-fit-cover"
      />
      <div class="album-overlay pos-absolute pos-t-0 pos-l-0 w-100 h-100 flex-center flex transition-cubic-in-out">
        <Button 
          @click.stop="playAlbum(album)" 
          class="play-button bg-main radius-round flex-center flex aspect-1x1"
          :showLoader="false"
          :showSucces="false"
        >
          <IconPlay class="i-small" fill="rgb(var(--black))" />
        </Button>
      </div>
    </div>
    <div class="album-info pd-small bg-dark-transp-20">
      <h3 class=" t-medium t-truncate">{{ album.title }}</h3>
      <p class="t-grey t-small t-truncate">{{ albumInfo }}</p>
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
  
  if (props.album.artist?.name) {
    artistName = props.album.artist.name;
  } else if (typeof props.album.artist === 'string') {
    artistName = props.album.artist;
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
  width: 48px;
  height: 48px;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.album-card:hover .play-button {
  transform: scale(1);
}
</style>