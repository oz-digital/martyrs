<!-- components/pages/Album.vue -->
<template>
  <div class="album-page">
    <div v-if="isLoading" class="w-100 h-25r flex-center flex">
      <Loader />
    </div>
    
    <div v-else-if="!album" class="t-center pd-big">
      <h2 class="">Album not found</h2>
      <p class="t-grey t-medium">The album you're looking for doesn't exist or has been removed.</p>
    </div>
    
    <div v-else>
      <!-- Album Header -->
      <div class="album-header mn-b-medium flex flex-v-center gap-medium">
        <div class="album-cover">
          <Media 
            :url="album.coverUrl || '/assets/placeholder-album.jpg'" 
            class="w-15r h-15r object-fit-cover shadow-lg radius-small"
          />
        </div>
        
        <div class="album-info">
          <div class="t-small t-uppercase ">Album</div>
          <h1 class="">{{ album.title }}</h1>
          
          <div class="album-meta mn-t-small flex flex-v-center">
            <router-link 
              v-if="album.artist && album.artist._id"
              :to="{ name: 'artist', params: { url: album.artist.url } }"
              class=" t-medium hover-t-main"
            >
              {{ getArtistName(album) }}
            </router-link>
            <span v-else class=" t-medium">{{ getArtistName(album) }}</span>
            
            <span class="t-grey mn-l-small mn-r-small">•</span>
            
            <span class="t-grey">{{ formatReleaseYear(album.releaseDate) }}</span>
            
            <span class="t-grey mn-l-small mn-r-small">•</span>
            
            <span class="t-grey">{{ albumTracks.length }} {{ albumTracks.length === 1 ? 'song' : 'songs' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Album Actions -->
      <div class="album-actions mn-b-medium flex flex-v-center gap-small">
        <Button 
          @click="playAlbum"
          class="play-button bg-main radius-round pd-small flex-v-center flex gap-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconPlay class="i-small" fill="rgb(var(--black))"/>
          <span class="t-black t-medium">Play</span>
        </Button>
        
        <Button 
          @click="toggleFavorite"
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconLike class="i-medium" :fill="isFavorite ? 'rgb(var(--main))' : 'rgb(var(--white))'"/>
        </Button>
        
        <Dropdown class="pos-relative">
          <Button 
            @click="showDropdown = !showDropdown"
            class="bg-transparent border-none pd-zero"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconEllipsis class="i-medium" fill="rgb(var(--white))"/>
          </Button>
          
          <template #content>
            <ul v-if="showDropdown" class="pd-small bg-dark radius-small pos-absolute pos-t-100 pos-r-0 z-index-3 w-max-15r mn-t-thin">
              <li class="mn-b-thin">
                <Button 
                  @click="addToQueue"
                  class="bg-transparent border-none pd-thin  w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Add to Queue</span>
                </Button>
              </li>
              <li>
                <Button 
                  @click="copyLink"
                  class="bg-transparent border-none pd-thin  w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Copy Link</span>
                </Button>
              </li>
            </ul>
          </template>
        </Dropdown>
      </div>
      
      <!-- Album Tracks -->
      <div class="album-tracks">
        <Feed
          :store="{
            read: () => Promise.resolve(albumTracks),
            state: { isLoading: false }
          }"
          :external="true"
          :items="albumTracks"
          :states="{
            empty: {
              title: 'No tracks in album',
              description: 'This album appears to be empty',
              class: 'pd-medium bg-dark-transp-10 radius-medium'
            }
          }"
          class="gap-thin"
        >
          <template #default="{ items }">
            <TrackCard
              v-for="track in items"
              :key="track._id"
              :track="track"
              :showAlbum="false"
              :showCover="false"
              class="w-100 bg-dark-transp-10 radius-medium"
            />
          </template>
        </Feed>
      </div>
      
      <!-- Album Info -->
      <div v-if="album.description" class="album-description mn-t-medium pd-medium bg-dark-transp-10 radius-medium">
        <h3 class=" mn-b-small">About</h3>
        <p class="t-grey">{{ album.description }}</p>
      </div>
      
      <!-- More from this artist if available -->
      <div v-if="moreFromArtist.length > 0" class="more-from-artist mn-t-medium">
        <div class="flex-between flex mn-b-small">
          <h2 class="">More by {{ getArtistName(album) }}</h2>
          <router-link 
            v-if="album.artist && album.artist._id"
            :to="{ name: 'artist', params: { url: album.artist.url } }" 
            class="t-main t-small hover-opacity"
          >
            See all
          </router-link>
        </div>
        
        <div class="albums-grid cols-5 mobile:cols-2 gap-small">
          <div v-for="relatedAlbum in moreFromArtist" :key="relatedAlbum._id">
            <AlbumCard :album="relatedAlbum" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import TrackCard from '../cards/TrackCard.vue';
import AlbumCard from '../cards/AlbumCard.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';

// Import icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';

// Import store modules
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';
import { actions as playerActions } from '../../store/player.js';

const route = useRoute();
const router = useRouter();

// State
const isLoading = ref(true);
const isFavorite = ref(false);
const showDropdown = ref(false);
const moreFromArtist = ref([]);

// Computed properties
const album = computed(() => albumsState.currentAlbum);
const albumTracks = computed(() => albumsState.currentAlbumTracks);

// Methods
const getArtistName = (albumItem) => {
  if (!albumItem) return 'Unknown Artist';
  
  if (albumItem.artist) {
    if (typeof albumItem.artist === 'object') {
      return albumItem.artist.name || 'Unknown Artist';
    }
    return albumItem.artist;
  }
  return 'Unknown Artist';
};

const formatReleaseYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

const playAlbum = () => {
  if (albumTracks.value && albumTracks.value.length > 0) {
    playerActions.setQueue(albumTracks.value);
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Implement favorite album logic here
};

const addToQueue = () => {
  if (albumTracks.value && albumTracks.value.length > 0) {
    // Add all tracks to queue
    albumTracks.value.forEach(track => {
      playerActions.addToQueue(track);
    });
    
    showDropdown.value = false;
  }
};

const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    // Could show a success notification here
    showDropdown.value = false;
  });
};

const fetchAlbumData = async () => {
  isLoading.value = true;
  
  try {
    // Fetch album data
    await albumsActions.fetchAlbumByUrl(route.params.url);
    
    // If artist is available, fetch more albums from the same artist
    if (album.value?.artist?._id) {
      const artistAlbums = await albumsActions.fetchAlbums({
        artist: album.value.artist._id,
        status: 'published',
        isPublic: true,
        limit: 5
      });
      
      // Filter out the current album
      moreFromArtist.value = artistAlbums.filter(a => a._id !== album.value._id);
    }
  } catch (error) {
    console.error('Error fetching album data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch data when component mounts or URL changes
onMounted(fetchAlbumData);

watch(() => route.params.url, (newUrl) => {
  if (newUrl) {
    fetchAlbumData();
  }
});
</script>

<style scoped>
.album-cover {
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
}
</style>