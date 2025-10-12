// store/albums.js
import Store from '@martyrs/src/modules/core/views/classes/core.store.js';
import { reactive } from 'vue';

// Create store instance
const albumStore = new Store(`${process.env.API_URL}/api/albums`);

// State
export const state = reactive({
  albums: [],
  featured: [],
  userAlbums: [],
  currentAlbum: null,
  currentAlbumTracks: [],
  isLoading: false,
  loadingFeatured: false,
});

// Actions
export const actions = {
  async fetchAlbums(options = {}) {
    state.isLoading = true;
    try {
      const albums = await albumStore.read(options);
      state.albums = albums;
      return albums;
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    } finally {
      state.isLoading = false;
    }
  },

  async fetchFeaturedAlbums() {
    state.loadingFeatured = true;
    try {
      const response = await fetch(`${process.env.API_URL}/api/albums/featured`);
      const albums = await response.json();
      state.featured = albums;
      return albums;
    } catch (error) {
      console.error('Error fetching featured albums:', error);
      return [];
    } finally {
      state.loadingFeatured = false;
    }
  },

  async fetchAlbumByUrl(url) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/albums/url/${url}`);
      const album = await response.json();
      state.currentAlbum = album;

      // Fetch album tracks
      await this.fetchAlbumTracks(album._id);

      return album;
    } catch (error) {
      console.error('Error fetching album by URL:', error);
      return null;
    }
  },

  async fetchAlbumTracks(albumId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/albums/${albumId}/tracks`);
      const tracks = await response.json();
      state.currentAlbumTracks = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching album tracks:', error);
      return [];
    }
  },

  async createAlbum(albumData) {
    try {
      const createdAlbum = await albumStore.create(albumData);
      // Update local state
      state.albums.unshift(createdAlbum);
      state.userAlbums.unshift(createdAlbum);
      return createdAlbum;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  },

  async updateAlbum(albumData) {
    try {
      const updatedAlbum = await albumStore.update(albumData);

      // Update local state
      const index = state.albums.findIndex(a => a._id === updatedAlbum._id);
      if (index !== -1) {
        state.albums[index] = updatedAlbum;
      }

      const userIndex = state.userAlbums.findIndex(a => a._id === updatedAlbum._id);
      if (userIndex !== -1) {
        state.userAlbums[userIndex] = updatedAlbum;
      }

      if (state.currentAlbum && state.currentAlbum._id === updatedAlbum._id) {
        state.currentAlbum = updatedAlbum;
      }

      return updatedAlbum;
    } catch (error) {
      console.error('Error updating album:', error);
      throw error;
    }
  },

  async deleteAlbum(albumId) {
    try {
      await albumStore.delete({ _id: albumId });

      // Update local state
      state.albums = state.albums.filter(a => a._id !== albumId);
      state.userAlbums = state.userAlbums.filter(a => a._id !== albumId);

      if (state.currentAlbum && state.currentAlbum._id === albumId) {
        state.currentAlbum = null;
        state.currentAlbumTracks = [];
      }

      return true;
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  },

  async fetchUserAlbums(userId) {
    try {
      const options = {
        creator: userId,
        limit: 100,
      };

      const albums = await albumStore.read(options);
      state.userAlbums = albums;
      return albums;
    } catch (error) {
      console.error('Error fetching user albums:', error);
      return [];
    }
  },

  async addTrackToAlbum(albumId, trackId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/tracks/${trackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ album: albumId }),
      });

      const updatedTrack = await response.json();

      // Update the current album tracks if relevant
      if (state.currentAlbum && state.currentAlbum._id === albumId) {
        state.currentAlbumTracks.push(updatedTrack);
      }

      return updatedTrack;
    } catch (error) {
      console.error('Error adding track to album:', error);
      throw error;
    }
  },

  async removeTrackFromAlbum(trackId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/tracks/${trackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ album: null }),
      });

      const updatedTrack = await response.json();

      // Update the current album tracks if relevant
      if (state.currentAlbumTracks.some(track => track._id === trackId)) {
        state.currentAlbumTracks = state.currentAlbumTracks.filter(track => track._id !== trackId);
      }

      return updatedTrack;
    } catch (error) {
      console.error('Error removing track from album:', error);
      throw error;
    }
  },
};
