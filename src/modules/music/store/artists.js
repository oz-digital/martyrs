// store/artists.js
import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';
import { reactive } from 'vue';

// Create store instance
const artistStore = new Store(`${process.env.API_URL}/api/artists`);

// State
export const state = reactive({
  artists: [],
  topArtists: [],
  userArtists: [],
  currentArtist: null,
  discography: {
    albums: [],
    singles: [],
  },
  relatedArtists: [],
  isLoading: false,
  loadingTopArtists: false,
});

// Actions
export const actions = {
  async fetchArtists(options = {}) {
    state.isLoading = true;
    try {
      const artists = await artistStore.read(options);
      state.artists = artists;
      return artists;
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    } finally {
      state.isLoading = false;
    }
  },

  async fetchTopArtists(limit = 10) {
    state.loadingTopArtists = true;
    try {
      // Assuming the backend sorts by popularity
      const options = {
        limit,
        sortParam: 'popularity',
        sortOrder: 'desc',
        status: 'published',
      };

      const artists = await artistStore.read(options);
      state.topArtists = artists;
      return artists;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      return [];
    } finally {
      state.loadingTopArtists = false;
    }
  },

  async fetchArtistByUrl(url) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/artists/url/${url}`);
      const artist = await response.json();
      state.currentArtist = artist;

      // Fetch artist discography
      await this.fetchArtistDiscography(artist._id);

      // Fetch related artists
      await this.fetchRelatedArtists(artist._id);

      return artist;
    } catch (error) {
      console.error('Error fetching artist by URL:', error);
      return null;
    }
  },

  async fetchArtistDiscography(artistId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/artists/${artistId}/discography`);
      const discography = await response.json();
      state.discography = {
        albums: discography.albums || [],
        singles: discography.singles || [],
      };
      return discography;
    } catch (error) {
      console.error('Error fetching artist discography:', error);
      return { albums: [], singles: [] };
    }
  },

  async fetchRelatedArtists(artistId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/artists/${artistId}/related`);
      const artists = await response.json();
      state.relatedArtists = artists;
      return artists;
    } catch (error) {
      console.error('Error fetching related artists:', error);
      return [];
    }
  },

  async createArtist(artistData) {
    try {
      const createdArtist = await artistStore.create(artistData);
      // Update local state
      state.artists.unshift(createdArtist);
      state.userArtists.unshift(createdArtist);
      return createdArtist;
    } catch (error) {
      console.error('Error creating artist:', error);
      throw error;
    }
  },

  async updateArtist(artistData) {
    try {
      const updatedArtist = await artistStore.update(artistData);

      // Update local state
      const index = state.artists.findIndex(a => a._id === updatedArtist._id);
      if (index !== -1) {
        state.artists[index] = updatedArtist;
      }

      const userIndex = state.userArtists.findIndex(a => a._id === updatedArtist._id);
      if (userIndex !== -1) {
        state.userArtists[userIndex] = updatedArtist;
      }

      if (state.currentArtist && state.currentArtist._id === updatedArtist._id) {
        state.currentArtist = updatedArtist;
      }

      return updatedArtist;
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  },

  async deleteArtist(artistId) {
    try {
      await artistStore.delete({ _id: artistId });

      // Update local state
      state.artists = state.artists.filter(a => a._id !== artistId);
      state.userArtists = state.userArtists.filter(a => a._id !== artistId);

      if (state.currentArtist && state.currentArtist._id === artistId) {
        state.currentArtist = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  },

  async fetchUserArtists(userId) {
    try {
      const options = {
        creator: userId,
        limit: 100,
      };

      const artists = await artistStore.read(options);

      console.log('artists is', artists);
      state.userArtists = artists;
      console.log('state is', state);
      return artists;
    } catch (error) {
      console.error('Error fetching user artists:', error);
      return [];
    }
  },
};
