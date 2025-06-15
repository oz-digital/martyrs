<!-- components/pages/MusicHome.vue -->
<template>
  <div class="music-home-page pd-medium mobile:pd-thin">
    <!-- Hero Section -->
    <section class="bg-gradient-dark pd-medium radius-medium mn-b-medium">
      <h1 class="t-white mn-b-small">Welcome to Music</h1>
      <p class="t-grey t-medium">Discover new tracks, albums, and playlists</p>
    </section>
    
    <!-- Featured Playlists Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Featured Playlists</h2>
        <router-link :to="{ path: '/music/playlists' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        v-model:items="featuredPlaylists"
        :isLoading="loadingFeatured"
        :showLoadMore="false"
        :skeleton="{
          structure: [
            { block: 'square', size: 'large', rounded: false },
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: false
        }"
        class="cols-5 mobile:cols-2 gap-small"
      >
        <template #default="{ items }">
          <li v-for="playlist in items" :key="playlist._id">
            <PlaylistCard :playlist="playlist" class="hover-scale-1 transition-cubic-in-out" />
          </li>
        </template>
      </Feed>
    </section>
    
    <!-- New Releases Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">New Releases</h2>
        <router-link :to="{ path: '/music/albums' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        v-model:items="recentAlbums"
        :isLoading="loadingRecentAlbums"
        :showLoadMore="false"
        :skeleton="{
          structure: [
            { block: 'square', size: 'large', rounded: false },
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: false
        }"
        class="cols-5 mobile:cols-2 gap-small"
      >
        <template #default="{ items }">
          <li v-for="album in items" :key="album._id">
            <AlbumCard :album="album" class="hover-scale-1 transition-cubic-in-out" />
          </li>
        </template>
      </Feed>
    </section>
    
    <!-- Popular Tracks Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Popular Tracks</h2>
        <router-link :to="{ path: '/music/tracks' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        v-model:items="popularTracks"
        :isLoading="loadingPopularTracks"
        :showLoadMore="false"
        :skeleton="{
          structure: [
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: true
        }"
      >
        <template #default="{ items }">
          <TrackList 
            :tracks="items" 
            :showAlbum="true" 
            :showCover="true"
            class="bg-dark-transp-10 radius-medium o-hidden"
          />
        </template>
      </Feed>
    </section>
    
    <!-- Top Artists Section -->
    <section>
      <div class="flex-between flex mn-b-small">
        <h2 class="">Top Artists</h2>
        <router-link :to="{ path: '/music/artists' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        v-model:items="topArtists"
        :isLoading="loadingTopArtists"
        :showLoadMore="false"
        :skeleton="{
          structure: [
            { block: 'circle', size: 'large' },
            { block: 'text', size: 'medium' }
          ],
          horizontal: false
        }"
        class="cols-6 mobile:cols-3 gap-small"
      >
        <template #default="{ items }">
          <li v-for="artist in items" :key="artist._id">
            <ArtistCard :artist="artist" class="hover-scale-1 transition-cubic-in-out" />
          </li>
        </template>
      </Feed>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import PlaylistCard from '../cards/PlaylistCard.vue';
import AlbumCard from '../cards/AlbumCard.vue';
import ArtistCard from '../cards/ArtistCard.vue';
import TrackList from '../lists/TrackList.vue';

// Store imports
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';
import { state as artistsState, actions as artistsActions } from '../../store/artists.js';

// Computed properties
const featuredPlaylists = computed(() => playlistsState.featuredPlaylists);
const recentAlbums = computed(() => albumsState.albums);
const popularTracks = computed(() => tracksState.popular);
const topArtists = computed(() => artistsState.topArtists);

// Loading states
const loadingFeatured = computed(() => playlistsState.loadingFeatured);
const loadingRecentAlbums = computed(() => albumsState.isLoading);
const loadingPopularTracks = computed(() => tracksState.loadingPopular);
const loadingTopArtists = computed(() => artistsState.loadingTopArtists);

onMounted(async () => {
  // Fetch featured playlists
  playlistsActions.fetchFeaturedPlaylists(5);
  
  // Fetch recent albums
  albumsActions.fetchAlbums({
    limit: 5,
    sortParam: 'releaseDate',
    sortOrder: 'desc'
  });
  
  // Fetch popular tracks
  tracksActions.fetchPopularTracks(10);
  
  // Fetch top artists
  artistsActions.fetchTopArtists(6);
});
</script>

<style scoped>
.bg-gradient-dark {
  background: linear-gradient(to bottom, rgba(var(--dark), 0.8), rgba(var(--black), 0.9));
}
</style>