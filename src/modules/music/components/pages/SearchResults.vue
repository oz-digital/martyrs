<!-- components/pages/SearchResults.vue -->
<template>
  <div class="search-results-page pd-medium">
    <div class="search-header mn-b-medium">
      <h1 class="mn-b-small">Search</h1>
      
      <BlockSearch 
        :placeholder="'What do you want to listen to?'"
        class="bg-light w-m-40r"
        @search="handleSearch"
        :autofocus="true"
      />
      
      <div v-if="searchQuery" class="search-filters flex gap-small mn-t-medium">
        <Button 
          v-for="filter in searchFilters"
          :key="filter.id"
          @click="setActiveFilter(filter.id)"
          :class="[
            filter.id === activeFilter ? 'bg-white t-black' : 'bg-white-transp-50 hover-bg-white',
          ]"
          class="radius-extra pd-small"
          :showLoader="false" 
          :showSucces="false"
        >
          {{ filter.label }}
        </Button>
      </div>
    </div>
    
    <div v-if="isLoading" class="search-loading">
      <Loader />
    </div>
    
    <div v-else-if="searchError" class="search-error t-center pd-big">
      <p class="t-fourth t-medium">{{ searchError }}</p>
    </div>
    
    <div v-else-if="!searchQuery" class="search-empty t-center pd-big">
      <h2 class="mn-b-small">Search for music</h2>
      <p class="t-transp t-medium">Find your favorite songs, artists, albums, and playlists</p>
    </div>
    
    <div v-else-if="!hasResults" class="search-no-results t-center pd-big">
      <h2 class="mn-b-small">No results found for "{{ searchQuery }}"</h2>
      <p class="t-transp t-medium">Please try different keywords or check your spelling</p>
    </div>
    
    <div v-else class="search-results">
      <!-- Songs Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'tracks') && trackResults.length > 0" class="search-section mn-b-medium">
        <div class="flex-between flex mn-b-small">
          <h2 class="">Songs</h2>
          <Button 
            v-if="trackResults.length > 5 && activeFilter === 'all'"
            @click="setActiveFilter('tracks')"
            class="t-main bg-transparent border-none hover-bg-white-transp-10 pd-thin"
            :showLoader="false" 
            :showSucces="false"
          >
            See all
          </Button>
        </div>
        
        <div class="bg-light radius-medium o-hidden">
          <TrackListCard
            v-for="(track, index) in (activeFilter === 'all' ? trackResults.slice(0, 5) : trackResults)"
            :key="track._id"
            :track="track"
            :index="index"
            :showAlbum="true"
            :showCover="true"
          />
        </div>
      </section>
      
      <!-- Artists Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'artists') && artistResults.length > 0" class="search-section mn-b-medium">
        <div class="flex-between flex mn-b-small">
          <h2 class="">Artists</h2>
          <Button 
            v-if="artistResults.length > 6 && activeFilter === 'all'"
            @click="setActiveFilter('artists')"
            class="t-main bg-transparent border-none hover-bg-white-transp-10 pd-thin"
            :showLoader="false" 
            :showSucces="false"
          >
            See all
          </Button>
        </div>
        
        <div class="artists-grid cols-6 mobile:cols-3 gap-small">
          <div v-for="artist in (activeFilter === 'all' ? artistResults.slice(0, 6) : artistResults)" :key="artist._id">
            <ArtistCard :artist="artist" />
          </div>
        </div>
      </section>
      
      <!-- Albums Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'albums') && albumResults.length > 0" class="search-section mn-b-medium">
        <div class="flex-between flex mn-b-small">
          <h2 class="">Albums</h2>
          <Button 
            v-if="albumResults.length > 5 && activeFilter === 'all'"
            @click="setActiveFilter('albums')"
            class="t-main bg-transparent border-none hover-bg-white-transp-10 pd-thin"
            :showLoader="false" 
            :showSucces="false"
          >
            See all
          </Button>
        </div>
        
        <div class="albums-grid cols-5 mobile:cols-2 gap-small">
          <div v-for="album in (activeFilter === 'all' ? albumResults.slice(0, 5) : albumResults)" :key="album._id">
            <AlbumCard :album="album" />
          </div>
        </div>
      </section>
      
      <!-- Playlists Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'playlists') && playlistResults.length > 0" class="search-section mn-b-medium">
        <div class="flex-between flex mn-b-small">
          <h2 class="">Playlists</h2>
          <Button 
            v-if="playlistResults.length > 5 && activeFilter === 'all'"
            @click="setActiveFilter('playlists')"
            class="t-main bg-transparent border-none hover-bg-white-transp-10 pd-thin"
            :showLoader="false" 
            :showSucces="false"
          >
            See all
          </Button>
        </div>
        
        <div class="playlists-grid cols-5 mobile:cols-2 gap-small">
          <div v-for="playlist in (activeFilter === 'all' ? playlistResults.slice(0, 5) : playlistResults)" :key="playlist._id">
            <PlaylistCard :playlist="playlist" />
          </div>
        </div>
      </section>
      
      <!-- Genres Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'genres') && genreResults.length > 0" class="search-section">
        <div class="flex-between flex mn-b-small">
          <h2 class="">Genres</h2>
          <Button 
            v-if="genreResults.length > 4 && activeFilter === 'all'"
            @click="setActiveFilter('genres')"
            class="t-main bg-transparent border-none hover-bg-white-transp-10 pd-thin"
            :showLoader="false" 
            :showSucces="false"
          >
            See all
          </Button>
        </div>
        
        <div class="genres-grid cols-4 mobile:cols-2 gap-small">
          <router-link 
            v-for="genre in (activeFilter === 'all' ? genreResults.slice(0, 4) : genreResults)" 
            :key="genre._id"
            :to="{ name: 'genre-detail', params: { url: genre.url } }"
            class="genre-card bg-gradient-color pd-medium radius-medium t-center hover-scale-1 transition-cubic-in-out"
            :style="{ 
              '--gradient-color': getRandomGradient() 
            }"
          >
            <h3 class="">{{ genre.name }}</h3>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BlockSearch from '@martyrs/src/modules/core/views/components/blocks/BlockSearch.vue';
import TrackListCard from '../cards/TrackListCard.vue';
import AlbumCard from '../cards/AlbumCard.vue';
import PlaylistCard from '../cards/PlaylistCard.vue';
import ArtistCard from '../cards/ArtistCard.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';

// Import search store
import { state as searchState, actions as searchActions } from '../../store/search.js';

const route = useRoute();
const router = useRouter();

// State
const searchQuery = ref('');
const activeFilter = ref('all');

// Array of search filters
const searchFilters = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'genres', label: 'Genres' }
];

// Computed properties
const isLoading = computed(() => searchState.isLoading);
const searchError = computed(() => searchState.error);
const hasResults = computed(() => {
  return trackResults.value.length > 0 || 
         artistResults.value.length > 0 || 
         albumResults.value.length > 0 || 
         playlistResults.value.length > 0 || 
         genreResults.value.length > 0;
});

const trackResults = computed(() => searchState.results.tracks || []);
const artistResults = computed(() => searchState.results.artists || []);
const albumResults = computed(() => searchState.results.albums || []);
const playlistResults = computed(() => searchState.results.playlists || []);
const genreResults = computed(() => searchState.results.genres || []);

// Methods
const handleSearch = (query) => {
  searchQuery.value = query;
  
  if (query.trim()) {
    // Update URL without reloading the page
    router.push({ 
      name: 'music-search', 
      query: { q: query },
      replace: true
    });
    
    // Perform search
    searchActions.search(query);
  } else {
    // Clear search when query is empty
    router.push({ 
      name: 'music-search',
      replace: true
    });
    searchActions.clearSearch();
  }
};

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  searchActions.setFilter(filter);
};

// Generate random gradient for genre cards
const getRandomGradient = () => {
  const colors = [
    'linear-gradient(135deg, #1DB954, #1ED760)',
    'linear-gradient(135deg, #FF6B6B, #FFE66D)',
    'linear-gradient(135deg, #4776E6, #8E54E9)',
    'linear-gradient(135deg, #FF8008, #FFC837)',
    'linear-gradient(135deg, #7F00FF, #E100FF)',
    'linear-gradient(135deg, #11998E, #38EF7D)'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Watch for URL query parameter changes
onMounted(() => {
  const query = route.query.q;
  if (query) {
    searchQuery.value = query;
    searchActions.search(query);
  }
});

watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery;
    searchActions.search(newQuery);
  } else if (!newQuery) {
    searchQuery.value = '';
    searchActions.clearSearch();
  }
});
</script>

<style scoped>
.bg-gradient-color {
  background: var(--gradient-color, linear-gradient(135deg, #1DB954, #1ED760));
}
</style>