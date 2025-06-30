<!-- components/pages/MusicLibrary.vue -->
<template>
  <div class="music-library-page">
    <h1 class=" mn-b-medium">Your Library</h1>
    
    <!-- Filter Tabs -->
    <div class="library-tabs mn-b-medium">
      <div class="flex gap-small">
        <Button 
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id ? 'bg-white t-black' : 'bg-dark-transp-50  hover-bg-dark',
          ]"
          class="radius-extra pd-small"
          :showLoader="false" 
          :showSucces="false"
        >
          {{ tab.label }}
        </Button>
      </div>
    </div>
    
    <!-- Content based on active tab -->
    <div v-if="isLoading" class="flex-center flex pd-big">
      <Loader />
    </div>
    
    <!-- Playlists Tab -->
    <div v-else-if="activeTab === 'playlists'" class="playlists-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Playlists</h2>
        <Button 
          @click="showCreatePlaylistModal = true"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Create Playlist
        </Button>
      </div>
      
      <div v-if="userPlaylists.length === 0" class="empty-state t-center pd-big bg-dark-transp-10 radius-medium">
        <h3 class=" mn-b-small">No playlists yet</h3>
        <p class="t-grey t-medium">Create your first playlist to see it here</p>
      </div>
      
      <PlaylistList v-else :playlists="userPlaylists" />
    </div>
    
    <!-- Albums Tab -->
    <div v-else-if="activeTab === 'albums'" class="albums-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Albums</h2>
      </div>
      
      <div v-if="userAlbums.length === 0" class="empty-state t-center pd-big bg-dark-transp-10 radius-medium">
        <h3 class=" mn-b-small">No albums yet</h3>
        <p class="t-grey t-medium">Upload your first album to see it here</p>
      </div>
      
      <AlbumList v-else :albums="userAlbums" />
    </div>
    
    <!-- Artists Tab -->
    <div v-else-if="activeTab === 'artists'" class="artists-tab">
      <ArtistManager/>
      <!-- <div class="flex-between flex mn-b-small">
        <h2 class="">Your Artists</h2>
      </div>
      
      <div v-if="userArtists.length === 0" class="empty-state t-center pd-big bg-dark-transp-10 radius-medium">
        <h3 class=" mn-b-small">No artists yet</h3>
        <p class="t-grey t-medium">Create your first artist profile to see it here</p>
      </div>
      
      <ArtistList v-else :artists="userArtists" /> -->
    </div>
    
    <!-- Tracks Tab -->
    <div v-else-if="activeTab === 'tracks'" class="tracks-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Tracks</h2>
        <Button 
          @click="$router.push({ name: 'music-upload' })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Upload Track
        </Button>
      </div>
      
      <div v-if="userTracks.length === 0" class="empty-state t-center pd-big bg-dark-transp-10 radius-medium">
        <h3 class=" mn-b-small">No tracks yet</h3>
        <p class="t-grey t-medium">Upload your first track to see it here</p>
      </div>
      
      <TrackList 
        v-else
        :tracks="userTracks"
        :showAlbum="true" 
        :showCover="true"
        class="bg-dark-transp-10 radius-medium o-hidden"
      />
    </div>
    
        <!-- Create Playlist Modal -->
    <Popup 
      v-if="showCreatePlaylistModal" 
      @close-popup="showCreatePlaylistModal = false" 
      class="bg-dark pd-small w-m-25r radius-medium "
    >
      <h3 class="mn-b-medium">Create Playlist</h3>
      <PlaylistForm @created="onPlaylistCreated" @cancel="showCreatePlaylistModal = false" />
    </Popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TrackList from '../lists/TrackList.vue';
import AlbumList from '../lists/AlbumList.vue';
import PlaylistList from '../lists/PlaylistList.vue';
import ArtistList from '../lists/ArtistList.vue';
import ArtistManager from '../pages/ArtistManager.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import PlaylistForm from '../forms/PlaylistForm.vue';

// Import store modules
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';
import { state as artistsState, actions as artistsActions } from '../../store/artists.js';
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';

const router = useRouter();

// State
const isLoading = ref(true);
const activeTab = ref('playlists');
const showCreatePlaylistModal = ref(false);

// Tabs configuration
const tabs = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'tracks', label: 'Tracks' }
];

// Computed
const userPlaylists = ref([]);
const userAlbums = ref([]);
const userArtists = ref([]);
const userTracks = ref([]);

// Methods
const fetchLibraryData = async () => {
  isLoading.value = true;
  
  try {
    if (!authState.user || !authState.user._id) {
      router.push({ name: 'Sign In', query: { redirect: router.currentRoute.value.fullPath } });
      return;
    }
    
    // Fetch user's content
    await tracksActions.fetchUserTracks(authState.user._id).then(tracks => userTracks.value = tracks || []);
  } catch (error) {
    console.error('Error fetching library data:', error);
  } finally {
    isLoading.value = false;
  }
};

const onPlaylistCreated = (playlist) => {
  userPlaylists.value.unshift(playlist);
  showCreatePlaylistModal.value = false;
  router.push({ name: 'playlist-detail', params: { url: playlist.url } });
};

// Fetch library data when component mounts
onMounted(fetchLibraryData);
</script>