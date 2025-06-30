// store/genres.js
import Store from '@martyrs/src/modules/globals/views/classes/globals.store.js';
import { reactive } from 'vue';

// Create store instance
const genreStore = new Store(`${process.env.API_URL}/api/genres`);

// State
export const state = reactive({
  genres: [],
  popularGenres: [],
  currentGenre: null,
  genreTracks: [],
  isLoading: false,
  loadingPopular: false,
});

// Actions
export const actions = {
  async fetchGenres(options = {}) {
    state.isLoading = true;
    try {
      const genres = await genreStore.read(options);
      state.genres = genres;
      return genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    } finally {
      state.isLoading = false;
    }
  },

  async fetchPopularGenres(options = {}) {
    state.loadingPopular = true;
    try {
      // Обрабатываем options от Feed компонента
      const queryOptions = {
        limit: options.limit || 10,
        sortParam: options.sortParam || 'popularity',
        sortOrder: options.sortOrder || 'desc',
        status: 'published',
      };
      
      // Добавляем дополнительные параметры если есть
      if (options.skip) queryOptions.skip = options.skip;
      if (options.search) queryOptions.search = options.search;
      
      // Если указан popular=true, используем сортировку по популярности
      if (options.popular) {
        queryOptions.sortParam = 'popularity';
        queryOptions.sortOrder = 'desc';
      }

      const genres = await genreStore.read(queryOptions);
      state.popularGenres = genres;
      return genres;
    } catch (error) {
      console.error('Error fetching popular genres:', error);
      return [];
    } finally {
      state.loadingPopular = false;
    }
  },

  async fetchGenreByUrl(url) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/genres/url/${url}`);
      const genre = await response.json();
      state.currentGenre = genre;

      // Fetch genre tracks
      await this.fetchGenreTracks(genre._id);

      return genre;
    } catch (error) {
      console.error('Error fetching genre by URL:', error);
      return null;
    }
  },

  async fetchGenreTracks(genreId) {
    try {
      const response = await fetch(`${process.env.API_URL}/api/genres/${genreId}/tracks`);
      const tracks = await response.json();
      state.genreTracks = tracks;
      return tracks;
    } catch (error) {
      console.error('Error fetching genre tracks:', error);
      return [];
    }
  },

  async createGenre(genreData) {
    try {
      const createdGenre = await genreStore.create(genreData);
      // Update local state
      state.genres.unshift(createdGenre);
      return createdGenre;
    } catch (error) {
      console.error('Error creating genre:', error);
      throw error;
    }
  },

  async updateGenre(genreData) {
    try {
      const updatedGenre = await genreStore.update(genreData);

      // Update local state
      const index = state.genres.findIndex(g => g._id === updatedGenre._id);
      if (index !== -1) {
        state.genres[index] = updatedGenre;
      }

      const popularIndex = state.popularGenres.findIndex(g => g._id === updatedGenre._id);
      if (popularIndex !== -1) {
        state.popularGenres[popularIndex] = updatedGenre;
      }

      if (state.currentGenre && state.currentGenre._id === updatedGenre._id) {
        state.currentGenre = updatedGenre;
      }

      return updatedGenre;
    } catch (error) {
      console.error('Error updating genre:', error);
      throw error;
    }
  },

  async deleteGenre(genreId) {
    try {
      await genreStore.delete({ _id: genreId });

      // Update local state
      state.genres = state.genres.filter(g => g._id !== genreId);
      state.popularGenres = state.popularGenres.filter(g => g._id !== genreId);

      if (state.currentGenre && state.currentGenre._id === genreId) {
        state.currentGenre = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting genre:', error);
      throw error;
    }
  },
};