<!-- components/pages/MusicHome.vue -->
<template>
  <div class="music-home-page pd-medium mobile:pd-thin">
    <!-- Featured Playlists Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Featured Playlists</h2>
        <router-link :to="{ path: '/music/playlists' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        :showLoadMore="false"
        :LoadMore="false"
        :states="{
          empty: {
            title: 'No Playlists',
            description: 'No featured playlists available at the moment.'
          }
        }"
        :store="{
          read: (options) => playlistsActions.fetchFeaturedPlaylists(options),
          state: playlistsState
        }"
        :options="{
          limit: 5,
          featured: true
        }"
        :skeleton="{
          structure: [
            { block: 'square', size: 'large', rounded: false },
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: false
        }"
        v-slot="{ items }"
        class="cols-5 mobile:cols-2 gap-small"
      >
        <li v-for="playlist in items" :key="playlist._id">
          <PlaylistCard :playlist="playlist" class="hover-scale-1 transition-cubic-in-out" />
        </li>
      </Feed>
    </section>
    
    <!-- New Releases Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">New Releases</h2>
        <router-link :to="{ path: '/music/albums' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        :showLoadMore="false"
        :LoadMore="false"
        :states="{
          empty: {
            title: 'No New Releases',
            description: 'No new albums available at the moment.'
          }
        }"
        :store="{
          read: (options) => albumsActions.fetchAlbums(options),
          state: albumsState
        }"
        :options="{
          limit: 4,
          sortParam: 'releaseDate',
          sortOrder: 'desc'
        }"
        :skeleton="{
          structure: [
            { block: 'square', size: 'large', rounded: false },
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: false
        }"
        v-slot="{ items }"
        class="cols-4 mobile:cols-2 gap-small"
      >
        <li v-for="album in items" :key="album._id">
          <AlbumCard :album="album" class="hover-scale-1 transition-cubic-in-out" />
        </li>
      </Feed>
    </section>
    
    <!-- Popular Tracks Section -->
    <section class="mn-b-medium">
      <div class="flex-between flex mn-b-small">
        <h2 class="">Popular Tracks</h2>
        <router-link :to="{ path: '/music/tracks' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        :showLoadMore="false"
        :LoadMore="false"
        :states="{
          empty: {
            title: 'No Popular Tracks',
            description: 'No popular tracks available at the moment.'
          }
        }"
        :store="{
          read: (options) => tracksActions.fetchPopularTracks(options),
          state: tracksState
        }"
        :options="{
          limit: 10,
          popular: true
        }"
        :skeleton="{
          structure: [
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ],
          horizontal: true
        }"
        v-slot="{ items }"
      >
        <TrackList 
          :tracks="items" 
          :showAlbum="true" 
          :showCover="true"
          class="bg-dark-transp-10 radius-medium o-hidden"
        />
      </Feed>
    </section>
    
    <!-- Top Artists Section -->
    <section>
      <div class="flex-between flex mn-b-small">
        <h2 class="">Top Artists</h2>
        <router-link :to="{ path: '/music/artists' }" class="t-main t-small hover-opacity">See all</router-link>
      </div>
      
      <Feed
        :showLoadMore="false"
        :LoadMore="false"
        :states="{
          empty: {
            title: 'No Artists',
            description: 'No top artists available at the moment.'
          }
        }"
        :store="{
          read: (options) => artistsActions.fetchTopArtists(options),
          state: artistsState
        }"
        :options="{
          limit: 6,
          top: true
        }"
        :skeleton="{
          structure: [
            { block: 'circle', size: 'large' },
            { block: 'text', size: 'medium' }
          ],
          horizontal: false
        }"
        v-slot="{ items }"
        class="cols-6 mobile:cols-3 gap-small"
      >
        <li v-for="artist in items" :key="artist._id">
          <ArtistCard :artist="artist" class="hover-scale-1 transition-cubic-in-out" />
        </li>
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
</script>

<style scoped>
.bg-gradient-dark {
  background: linear-gradient(to bottom, rgba(var(--dark), 0.8), rgba(var(--black), 0.9));
}
</style>