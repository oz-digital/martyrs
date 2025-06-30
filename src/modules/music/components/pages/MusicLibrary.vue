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
    
    <!-- Playlists Tab -->
    <div v-if="activeTab === 'playlists'" class="playlists-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Playlists</h2>
        <Button 
          @click="$router.push({ name: 'playlist-create' })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Create Playlist
        </Button>
      </div>
      
      <Feed
        :store="{
          read: (options) => playlistsActions.fetchPlaylists({ ...options, owner: { type: 'user', target: authState.user._id } }),
          state: playlistsState
        }"
        :options="{ owner: { type: 'user', target: authState.user._id } }"
        :states="{
          empty: {
            title: 'No playlists yet',
            description: 'Create your first playlist to see it here',
            class: 'pd-big bg-dark-transp-10 radius-medium'
          }
        }"
        class="gap-medium"
      >
        <template #default="{ items }">
          <PlaylistCard
            v-for="playlist in items"
            :key="playlist._id"
            :playlist="playlist"
            class="w-100"
          />
        </template>
      </Feed>
    </div>
    
    <!-- Albums Tab -->
    <div v-if="activeTab === 'albums'" class="albums-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Albums</h2>
        <Button 
          @click="$router.push({ name: 'album-create' })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Create Album
        </Button>
      </div>
      
      <Feed
        :store="{
          read: (options) => albumsActions.fetchAlbums({ ...options, owner: { type: 'user', target: authState.user._id } }),
          state: albumsState
        }"
        :options="{ owner: { type: 'user', target: authState.user._id } }"
        :states="{
          empty: {
            title: 'No albums yet',
            description: 'Upload your first album to see it here',
            class: 'pd-big bg-dark-transp-10 radius-medium'
          }
        }"
        class="gap-medium"
      >
        <template #default="{ items }">
          <AlbumCard
            v-for="album in items"
            :key="album._id"
            :album="album"
            class="w-100"
          />
        </template>
      </Feed>
    </div>
    
    <!-- Artists Tab -->
    <div v-if="activeTab === 'artists'" class="artists-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Artists</h2>
        <Button 
          @click="$router.push({ name: 'artist-create' })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Create Artist
        </Button>
      </div>
      
      <Feed
        :store="{
          read: (options) => artistsActions.fetchArtists({ ...options, owner: { type: 'user', target: authState.user._id } }),
          state: artistsState
        }"
        :options="{ owner: { type: 'user', target: authState.user._id } }"
        :states="{
          empty: {
            title: 'No artists yet',
            description: 'Create your first artist profile to see it here',
            class: 'pd-big bg-dark-transp-10 radius-medium'
          }
        }"
        class="gap-medium"
      >
        <template #default="{ items }">
          <ArtistCard
            v-for="artist in items"
            :key="artist._id"
            :artist="artist"
            class="w-100"
          />
        </template>
      </Feed>
    </div>
    
    <!-- Tracks Tab -->
    <div v-if="activeTab === 'tracks'" class="tracks-tab">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Your Tracks</h2>
        <Button 
          @click="$router.push({ name: 'track-create' })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Upload Track
        </Button>
      </div>
      
      <Feed
        :store="{
          read: (options) => tracksActions.fetchTracks({ ...options, owner: { type: 'user', target: authState.user._id } }),
          state: tracksState
        }"
        :options="{ owner: { type: 'user', target: authState.user._id } }"
        :states="{
          empty: {
            title: 'No tracks yet',
            description: 'Upload your first track to see it here',
            class: 'pd-big bg-dark-transp-10 radius-medium'
          }
        }"
        class="gap-medium"
      >
        <template #default="{ items }">
          <TrackCard
            v-for="track in items"
            :key="track._id"
            :track="track"
            :showAlbum="true"
            :showCover="true"
            class="w-100 bg-dark-transp-10 radius-medium"
          />
        </template>
      </Feed>
    </div>
    
      </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import TrackCard from '../cards/TrackCard.vue';
import AlbumCard from '../cards/AlbumCard.vue';
import PlaylistCard from '../cards/PlaylistCard.vue';
import ArtistCard from '../cards/ArtistCard.vue';
import Button from '@martyrs/src/components/Button/Button.vue';

// Import store modules
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';
import { state as artistsState, actions as artistsActions } from '../../store/artists.js';
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';

const router = useRouter();

// State
const activeTab = ref('playlists');

// Tabs configuration
const tabs = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'tracks', label: 'Tracks' }
];

</script>