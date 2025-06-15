// store/playlists.js
import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';
import { reactive } from 'vue';

// Create store instance
const playlistStore = new Store(`${process.env.API_URL}/api/playlists`);

// State
export const state = reactive({
  playlists: [],
  featuredPlaylists: [],
  userPlaylists: [],
  currentPlaylist: null,
  currentPlaylistTracks: [],
  isLoading: false,
  loadingFeatured: false,
});

// Actions
export const actions = {
  async fetchPlaylists(options = {}) {
    state.isLoading = true;
    try {
      const playlists = await playlistStore.read(options);
      state.playlists = playlists;
      return playlists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    } finally {
      state.isLoading = false;
    }
  },

  async fetchFeaturedPlaylists(limit = 10) {
    state.loadingFeatured = true;
    try {
      // Assuming there's a status field for featured playlists
      const options = {
        status: 'featured',
        isPublic: true,
        limit,
      };

      const playlists = await playlistStore.read(options);
      state.featuredPlaylists = playlists;
      return playlists;
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      return [];
    } finally {
      state.loadingFeatured = false;
    }
  },

  async fetchPlaylistByUrl(url) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/playlists/url/${url}`);
      const playlist = await response.json();
      state.currentPlaylist = playlist;

      // Extract tracks from the playlist
      state.currentPlaylistTracks = playlist.tracks?.map(item => item.track) || [];

      return playlist;
    } catch (error) {
      console.error('Error fetching playlist by URL:', error);
      return null;
    }
  },

  async createPlaylist(playlistData) {
    try {
      const createdPlaylist = await playlistStore.create(playlistData);
      // Update local state
      state.playlists.unshift(createdPlaylist);
      state.userPlaylists.unshift(createdPlaylist);
      return createdPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  async updatePlaylist(playlistData) {
    try {
      const updatedPlaylist = await playlistStore.update(playlistData);

      // Update local state
      const index = state.playlists.findIndex(p => p._id === updatedPlaylist._id);
      if (index !== -1) {
        state.playlists[index] = updatedPlaylist;
      }

      const userIndex = state.userPlaylists.findIndex(p => p._id === updatedPlaylist._id);
      if (userIndex !== -1) {
        state.userPlaylists[userIndex] = updatedPlaylist;
      }

      if (state.currentPlaylist && state.currentPlaylist._id === updatedPlaylist._id) {
        state.currentPlaylist = updatedPlaylist;
      }

      return updatedPlaylist;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  async deletePlaylist(playlistId) {
    try {
      await playlistStore.delete({ _id: playlistId });

      // Update local state
      state.playlists = state.playlists.filter(p => p._id !== playlistId);
      state.userPlaylists = state.userPlaylists.filter(p => p._id !== playlistId);

      if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
        state.currentPlaylist = null;
        state.currentPlaylistTracks = [];
      }

      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  async fetchUserPlaylists(userId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/playlists/user/${userId || ''}`);
      const playlists = await response.json();
      state.userPlaylists = playlists;
      return playlists;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return [];
    }
  },

  async addTrackToPlaylist(playlistId, trackId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const updatedPlaylist = await response.json();

      // Update local state
      if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
        state.currentPlaylist = updatedPlaylist;
        // Update tracks list
        const track = updatedPlaylist.tracks.find(item => item.track._id === trackId)?.track;
        if (track && !state.currentPlaylistTracks.some(t => t._id === trackId)) {
          state.currentPlaylistTracks.push(track);
        }
      }

      return updatedPlaylist;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  },

  async removeTrackFromPlaylist(playlistId, trackId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
      });

      const updatedPlaylist = await response.json();

      // Update local state
      if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
        state.currentPlaylist = updatedPlaylist;
        state.currentPlaylistTracks = state.currentPlaylistTracks.filter(track => track._id !== trackId);
      }

      return updatedPlaylist;
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw error;
    }
  },

  async addCollaborator(playlistId, userId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/playlists/${playlistId}/collaborators/${userId}`, {
        method: 'POST',
      });

      const updatedPlaylist = await response.json();

      // Update local state
      if (state.currentPlaylist && state.currentPlaylist._id === playlistId) {
        state.currentPlaylist = updatedPlaylist;
      }

      return updatedPlaylist;
    } catch (error) {
      console.error('Error adding collaborator to playlist:', error);
      throw error;
    }
  },
};
