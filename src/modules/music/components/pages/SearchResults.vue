<!-- components/pages/SearchResults.vue -->
<template>
  <div class="search-results-page">
    <div class="search-header mn-b-medium">
      <h1 class="t-white mn-b-small">Search</h1>
      
      <SearchForm 
        :initialQuery="searchQuery"
        @search="handleSearch"
        placeholder="What do you want to listen to?"
        class="w-m-40r"
      />
      
      <div v-if="searchQuery" class="search-filters flex gap-small mn-t-medium">
        <Button 
          v-for="filter in searchFilters"
          :key="filter.id"
          @click="setActiveFilter(filter.id)"
          :class="[
            filter.id === activeFilter ? 'bg-white t-black' : 'bg-dark-transp-50 t-white hover-bg-dark',
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
      <h2 class="t-white mn-b-small">Search for music</h2>
      <p class="t-grey t-medium">Find your favorite songs, artists, albums, and playlists</p>
    </div>
    
    <div v-else-if="!hasResults" class="search-no-results t-center pd-big">
      <h2 class="t-white mn-b-small">No results found for "{{ searchQuery }}"</h2>
      <p class="t-grey t-medium">Please try different keywords or check your spelling</p>
    </div>
    
    <div v-else class="search-results">
      <!-- Top Results Section -->
      <section v-if="activeFilter === 'all'" class="search-section mn-b-medium">
        <h2 class="t-white mn-b-small">Top Result</h2>
        
        <div class="search-top-result bg-dark-transp-20 radius-medium p-medium">
          <div v-if="topResult.type === 'artist'" class="top-result-artist pd-medium">
            <div class="top-artist-photo mn-b-medium">
              <Media 
                :url="topResult.item.photoUrl || '/assets/placeholder-artist.jpg'" 
                class="w-10r h-10r object-fit-cover radius-round"
              />
            </div>
            <h3 class="t-white t-semi">{{ topResult.item.name }}</h3>
            <p class="t-grey">Artist</p>
            <Button 
              @click="playTopResult"
              class="bg-main radius-round pd-small t-white mn-t-medium hover-scale-1"
              :showLoader="false" 
              :showSucces="false"
            >
              PLAY
            </Button>
          </div>
          
          <div v-else-if="topResult.type === 'album'" class="top-result-album pd-medium">
            <div class="top-album-cover mn-b-medium">
              <Media 
                :url="topResult.item.coverUrl || '/assets/placeholder-album.jpg'" 
                class="w-10r h-10r object-fit-cover radius-small"
              />
            </div>
            <h3 class="t-white t-semi">{{ topResult.item.title }}</h3>
            <p class="t-grey">Album • {{ getArtistName(topResult.item) }}</p>
            <Button 
              @click="playTopResult"
              class="bg-main radius-round pd-small t-white mn-t-medium hover-scale-1"
              :showLoader="false" 
              :showSucces="false"
            >
              PLAY
            </Button>
          </div>
          
          <div v-else-if="topResult.type === 'playlist'" class="top-result-playlist pd-medium">
            <div class="top-playlist-cover mn-b-medium">
              <Media 
                :url="topResult.item.coverUrl || '/assets/placeholder-playlist.jpg'" 
                class="w-10r h-10r object-fit-cover radius-small"
              />
            </div>
            <h3 class="t-white t-semi">{{ topResult.item.title }}</h3>
            <p class="t-grey">Playlist • {{ getPlaylistOwner(topResult.item) }}</p>
            <Button 
              @click="playTopResult"
              class="bg-main radius-round pd-small t-white mn-t-medium hover-scale-1"
              :showLoader="false" 
              :showSucces="false"
            >
              PLAY
            </Button>
          </div>
        </div>
      </section>
      
      <!-- Songs Results -->
      <section v-if="activeFilter === 'all' || activeFilter === 'tracks'" class="search-section mn-b-medium">
        <h2 class="t-white mn-b-small">Songs</h2>
        <TrackList 
          :tracks="trackResults"
          :showAlbum="true" 
          :showCover="true"
          class="bg-dark-transp-10 radius-medium o-hidden"
        />
        
        <Button 
          v-if="trackResults.length > 4 && activeFilter === 'all'"
          @click="setActiveFilter('tracks')"
          class="t-main bg-transparent border-none t-center w-100 mn-t-small hover-bg-dark-transp-10 pd-thin"
          :showLoader="false" 
          :showSucces="false"
        >
          See all songs
        </Button>
      </section>
      
      <!-- Artists Results -->
      <section v-if="activeFilter === 'all' || activeFilter === 'artists'" class="search-section mn-b-medium">
        <h2 class="t-white mn-b-small">Artists</h2>
        
        <div class="artists-grid cols-6 mobile:cols-3 gap-small">
          <div v-for="artist in artistResults.slice(0, activeFilter === 'all' ? 6 : artistResults.length)" :key="artist._id">
            <ArtistCard :artist="artist" />
          </div>
        </div>
        
        <Button 
          v-if="artistResults.length > 6 && activeFilter === 'all'"
          @click="setActiveFilter('artists')"
          class="t-main bg-transparent border-none t-center w-100 mn-t-small hover-bg-dark-transp-10 pd-thin"
          :showLoader="false" 
          :showSucces="false"
        >
          See all artists
        </Button>
      </section>
      
      <!-- Albums Results -->
      <section v-if="activeFilter === 'all' || activeFilter === 'albums'" class="search-section mn-b-medium">
        <h2 class="t-white mn-b-small">Albums</h2>
        
        <div class="albums-grid cols-5 mobile:cols-2 gap-small">
          <div v-for="album in albumResults.slice(0, activeFilter === 'all' ? 5 : albumResults.length)" :key="album._id">
            <AlbumCard :album="album" />
          </div>
        </div>
        
        <Button 
          v-if="albumResults.length > 5 && activeFilter === 'all'"
          @click="setActiveFilter('albums')"
          class="t-main bg-transparent border-none t-center w-100 mn-t-small hover-bg-dark-transp-10 pd-thin"
          :showLoader="false" 
          :showSucces="false"
        >
          See all albums
        </Button>
      </section>
      
      <!-- Playlists Results -->
      <section v-if="activeFilter === 'all' || activeFilter === 'playlists'" class="search-section mn-b-medium">
        <h2 class="t-white mn-b-small">Playlists</h2>
        
        <div class="playlists-grid cols-5 mobile:cols-2 gap-small">
          <div v-for="playlist in playlistResults.slice(0, activeFilter === 'all' ? 5 : playlistResults.length)" :key="playlist._id">
            <PlaylistCard :playlist="playlist" />
          </div>
        </div>
        
        <Button 
          v-if="playlistResults.length > 5 && activeFilter === 'all'"
          @click="setActiveFilter('playlists')"
          class="t-main bg-transparent border-none t-center w-100 mn-t-small hover-bg-dark-transp-10 pd-thin"
          :showLoader="false" 
          :showSucces="false"
        >
          See all playlists
        </Button>
      </section>
      
      <!-- Genres Results -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'genres') && genreResults.length > 0" class="search-section">
        <h2 class="t-white mn-b-small">Genres</h2>
        
        <div class="genres-grid cols-4 mobile:cols-2 gap-small">
          <router-link 
            v-for="genre in genreResults.slice(0, activeFilter === 'all' ? 4 : genreResults.length)" 
            :key="genre._id"
            :to="{ name: 'genre-detail', params: { url: genre.url } }"
            class="genre-card bg-gradient-color pd-medium radius-medium t-center hover-scale-1 transition-cubic-in-out"
            :style="{ 
              '--gradient-color': getRandomGradient() 
            }"
          >
            <h3 class="t-white">{{ genre.name }}</h3>
          </router-link>
        </div>
        
        <Button 
          v-if="genreResults.length > 4 && activeFilter === 'all'"
          @click="setActiveFilter('genres')"
          class="t-main bg-transparent border-none t-center w-100 mn-t-small hover-bg-dark-transp-10 pd-thin"
          :showLoader="false" 
          :showSucces="false"
        >
          See all genres
        </Button>
      </section>
    </div>
  </div>
  </template>

  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import SearchForm from '../forms/SearchForm.vue';
  import TrackList from '../lists/TrackList.vue';
  import AlbumCard from '../cards/AlbumCard.vue';
  import PlaylistCard from '../cards/PlaylistCard.vue';
  import ArtistCard from '../cards/ArtistCard.vue';
  import Button from '@martyrs/src/components/Button/Button.vue';
  import Loader from '@martyrs/src/components/Loader/Loader.vue';
  import Media from '@martyrs/src/components/Media/Media.vue';

  // Import search store
  import { state as searchState, actions as searchActions, computed as searchComputed } from '../../store/search.js';
  import { actions as playerActions } from '../../store/player.js';

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
  const hasResults = computed(() => searchComputed.hasResults());

  const trackResults = computed(() => searchState.results.tracks || []);
  const artistResults = computed(() => searchState.results.artists || []);
  const albumResults = computed(() => searchState.results.albums || []);
  const playlistResults = computed(() => searchState.results.playlists || []);
  const genreResults = computed(() => searchState.results.genres || []);

  // Top result determination
  const topResult = computed(() => {
    // Determine which result to show as top result based on relevance
    if (artistResults.value.length > 0) {
      return { type: 'artist', item: artistResults.value[0] };
    } else if (albumResults.value.length > 0) {
      return { type: 'album', item: albumResults.value[0] };
    } else if (playlistResults.value.length > 0) {
      return { type: 'playlist', item: playlistResults.value[0] };
    } else if (trackResults.value.length > 0) {
      return { type: 'track', item: trackResults.value[0] };
    }
    return null;
  });

  // Methods
  const handleSearch = (query) => {
    searchQuery.value = query;
    
    // Update URL without reloading the page
    router.push({ 
      name: 'music-search', 
      query: { q: query },
      replace: true
    });
    
    // Perform search
    searchActions.search(query);
  };

  const setActiveFilter = (filter) => {
    activeFilter.value = filter;
    searchActions.setFilter(filter);
  };

  const playTopResult = () => {
    if (!topResult.value) return;
    
    const { type, item } = topResult.value;
    
    switch (type) {
      case 'track':
        playerActions.playTrack(item);
        break;
      case 'album':
        // Navigate to album page
        router.push({ name: 'album-detail', params: { url: item.url } });
        break;
      case 'playlist':
        // Navigate to playlist page
        router.push({ name: 'playlist-detail', params: { url: item.url } });
        break;
      case 'artist':
        // Navigate to artist page
        router.push({ name: 'artist-detail', params: { url: item.url } });
        break;
    }
  };

  const getArtistName = (item) => {
    if (!item) return 'Unknown Artist';
    
    if (item.artist) {
      if (typeof item.artist === 'object') {
        return item.artist.name || 'Unknown Artist';
      }
      return item.artist;
    }
    return 'Unknown Artist';
  };

  const getPlaylistOwner = (playlist) => {
    if (!playlist) return 'Unknown';
    
    if (playlist.owner?.target) {
      if (typeof playlist.owner.target === 'object') {
        if (playlist.owner.target.profile?.name) {
          return playlist.owner.target.profile.name;
        }
        return playlist.owner.target.name || 'Unknown';
      }
    }
    return 'Unknown';
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