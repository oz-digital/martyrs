// store/tracks.js
import Store from '@martyrs/src/modules/core/views/classes/core.store.js';
import { reactive } from 'vue';

// Create store instance
const trackStore = new Store(`${process.env.API_URL}/api/tracks`);

// State
export const state = reactive({
  tracks: [],
  popular: [],
  recent: [],
  featured: [],
  userTracks: [],
  currentTrack: null,
  relatedTracks: [],
  isLoading: false,
  loadingPopular: false,
  loadingRecent: false,
  loadingFeatured: false,
});

// Actions
export const actions = {
  async fetchTracks(options = {}) {
    state.isLoading = true;
    try {
      const tracks = await trackStore.read(options);
      state.tracks = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return [];
    } finally {
      state.isLoading = false;
    }
  },

  async fetchPopularTracks(options = {}) {
    state.loadingPopular = true;
    try {
      // Обрабатываем options от Feed компонента
      const queryParams = new URLSearchParams();
      queryParams.append('limit', options.limit || 10);
      
      if (options.skip) queryParams.append('skip', options.skip);
      if (options.search) queryParams.append('search', options.search);
      
      const response = await fetch(`${process.env.API_URL}/api/tracks/popular?${queryParams.toString()}`);
      const tracks = await response.json();
      state.popular = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching popular tracks:', error);
      return [];
    } finally {
      state.loadingPopular = false;
    }
  },

  async fetchRecentTracks(limit = 10) {
    state.loadingRecent = true;
    try {
      const response = await fetch(`${process.env.API_URL}/api/tracks/recent?limit=${limit}`);
      const tracks = await response.json();
      state.recent = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
      return [];
    } finally {
      state.loadingRecent = false;
    }
  },

  async fetchTracksByGenre(genreId, limit = 20) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/tracks/genre/${genreId}?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching tracks by genre:', error);
      return [];
    }
  },

  async fetchTrackByUrl(url) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/tracks/url/${url}`);
      const track = await response.json();
      state.currentTrack = track;
      return track;
    } catch (error) {
      console.error('Error fetching track by URL:', error);
      return null;
    }
  },

  // Improved createTrack action with better error handling
  async createTrack(trackData) {
    console.log('Creating track with data:', trackData);

    // Validate required fields to prevent silent failures
    const requiredFields = ['title', 'artist', 'genre', 'fileUrl'];
    const missingFields = requiredFields.filter(field => !trackData[field]);

    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      console.error(error);
      throw error;
    }

    // Ensure proper structure for owner and creator fields
    if (!trackData.owner || !trackData.owner.target || !trackData.owner.type) {
      console.error('Track data missing owner information');
      throw new Error('Owner information is required');
    }

    if (!trackData.creator || !trackData.creator.target || !trackData.creator.type) {
      console.error('Track data missing creator information');
      throw new Error('Creator information is required');
    }

    try {
      console.log('Calling API to create track...');

      // Check what API URL we're using
      console.log('API URL:', trackStore.apiUrl);

      // Use a timeout to detect hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000);
      });

      // Race between the actual request and the timeout
      const createdTrack = await Promise.race([trackStore.create(trackData), timeoutPromise]);

      console.log('Track created successfully, server response:', createdTrack);

      // Check if the response is what we expect
      if (!createdTrack || !createdTrack._id) {
        console.error('API returned success but without expected track data:', createdTrack);
        throw new Error('Invalid response from server');
      }

      // Update local state
      state.tracks.unshift(createdTrack);
      state.userTracks.unshift(createdTrack);

      console.log('Local state updated with new track');
      return createdTrack;
    } catch (error) {
      console.error('Error creating track:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('Error response:', error.response);
      }

      // Format the error for better user feedback
      const formattedError = new Error(error.message || 'Failed to create track. Please try again.');
      formattedError.originalError = error;

      // Set a global error
      setError({
        message: formattedError.message,
        errorCode: error.errorCode || 'TRACK_CREATE_FAILED',
      });

      throw formattedError;
    }
  },

  async updateTrack(trackData) {
    try {
      const updatedTrack = await trackStore.update(trackData);

      // Update local state
      const index = state.tracks.findIndex(t => t._id === updatedTrack._id);
      if (index !== -1) {
        state.tracks[index] = updatedTrack;
      }

      const userIndex = state.userTracks.findIndex(t => t._id === updatedTrack._id);
      if (userIndex !== -1) {
        state.userTracks[userIndex] = updatedTrack;
      }

      if (state.currentTrack && state.currentTrack._id === updatedTrack._id) {
        state.currentTrack = updatedTrack;
      }

      return updatedTrack;
    } catch (error) {
      console.error('Error updating track:', error);
      throw error;
    }
  },

  async deleteTrack(trackId) {
    try {
      await trackStore.delete({ _id: trackId });

      // Update local state
      state.tracks = state.tracks.filter(t => t._id !== trackId);
      state.userTracks = state.userTracks.filter(t => t._id !== trackId);

      if (state.currentTrack && state.currentTrack._id === trackId) {
        state.currentTrack = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error;
    }
  },

  async fetchUserTracks(userId) {
    try {
      const options = {
        creator: userId,
        limit: 100,
      };
      console.log('fetchUserTracks', userId);
      const tracks = await trackStore.read(options);
      state.userTracks = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching user tracks:', error);
      return [];
    }
  },

  async fetchRelatedTracks(trackUrl) {
    try {
      // Если есть currentTrack, ищем треки того же артиста
      if (state.currentTrack && state.currentTrack.artist) {
        const artistId = typeof state.currentTrack.artist === 'object' 
          ? state.currentTrack.artist._id 
          : state.currentTrack.artist;
          
        const queryParams = new URLSearchParams();
        queryParams.append('artist', artistId);
        queryParams.append('limit', '5');
        
        const response = await fetch(`${process.env.API_URL}/api/tracks/read?${queryParams.toString()}`);
        const tracks = await response.json();
        
        // Исключаем текущий трек
        const relatedTracks = tracks.filter(track => track._id !== state.currentTrack._id);
        state.relatedTracks = relatedTracks;
        return relatedTracks;
      }
      
      state.relatedTracks = [];
      return [];
    } catch (error) {
      console.error('Error fetching related tracks:', error);
      state.relatedTracks = [];
      return [];
    }
  },
};
