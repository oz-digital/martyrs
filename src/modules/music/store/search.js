// store/search.js
import { reactive } from 'vue';

// State
export const state = reactive({
  query: '',
  results: {
    tracks: [],
    albums: [],
    artists: [],
    playlists: [],
    genres: [],
  },
  isLoading: false,
  error: null,
  activeFilter: 'all', // 'all', 'tracks', 'albums', 'artists', 'playlists', 'genres'
});

// Actions
export const actions = {
  async search(query, type = null, limit = 10) {
    if (!query || query.length < 2) {
      // Reset results if query is too short
      state.results = {
        tracks: [],
        albums: [],
        artists: [],
        playlists: [],
        genres: [],
      };
      state.error = 'Search query must be at least 2 characters';
      return;
    }

    state.query = query;
    state.isLoading = true;
    state.error = null;

    try {
      const queryParams = new URLSearchParams({
        query,
        limit,
      });

      if (type) {
        queryParams.append('type', type);
      }

      const response = await fetch(`${process.env.API_URL}/api/music/search?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();

      // Update state with results
      state.results = {
        tracks: data.tracks || [],
        albums: data.albums || [],
        artists: data.artists || [],
        playlists: data.playlists || [],
        genres: data.genres || [],
      };
    } catch (error) {
      console.error('Search error:', error);
      state.error = error.message;
      // Clear results on error
      state.results = {
        tracks: [],
        albums: [],
        artists: [],
        playlists: [],
        genres: [],
      };
    } finally {
      state.isLoading = false;
    }
  },

  setFilter(filter) {
    state.activeFilter = filter;
  },

  clearSearch() {
    state.query = '';
    state.results = {
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
      genres: [],
    };
    state.error = null;
    state.isLoading = false;
  },
};

// Computed values
export const computed = {
  hasResults: () => {
    return Object.values(state.results).some(arr => arr.length > 0);
  },

  filteredResults: () => {
    if (state.activeFilter === 'all') {
      return state.results;
    }

    // Return only the filtered category
    const filtered = {
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
      genres: [],
    };

    filtered[state.activeFilter] = state.results[state.activeFilter];
    return filtered;
  },

  totalResultsCount: () => {
    return Object.values(state.results).reduce((sum, arr) => sum + arr.length, 0);
  },
};
