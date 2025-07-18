<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex-center flex pd-extra">
      <Loader />
    </div>
    
    <!-- Artist not found -->
    <div v-else-if="!artist" class="flex-center flex-column flex pd-extra">
      <h2 class="h2 mn-b-medium">Artist Not Found</h2>
      <p class="p-medium t-transp mn-b-medium">The artist you are looking for doesn't exist or may have been removed.</p>
      <Button
        :submit="() => router.push({ name: 'music-home' })"
        class="bg-main "
        :showSucces="false"
        :showLoader="false"
      >
        Back to Music
      </Button>
    </div>
    
    <!-- Artist content -->
    <div v-else>
      <!-- Cover image -->
      <div 
        class="w-100 t-white h-50vh pos-relative"
        :style="artist.coverUrl ? `background-image: url(${FILE_SERVER_URL + artist.coverUrl}); background-size: cover; background-position: center;` : ''"
      >
        <div class="pos-absolute pos-t-0 pos-l-0 w-100 h-100 bg-blur-small" :class="artist.coverUrl ? 'bg-black-transp-50' : 'bg-black'"></div>
        
        <!-- Artist actions for edit/manage -->
        <div v-if="isOwner" class="pos-absolute pos-t-medium pos-r-medium z-index-1">
          <Button
            :submit="editArtist"
            class="bg-main  mn-r-small"
            :showSucces="false"
            :showLoader="false"
          >
            Edit Artist
          </Button>
          
          <Button
            :submit="manageContent"
            class="bg-white t-black"
            :showSucces="false"
            :showLoader="false"
          >
            Manage Content
          </Button>
        </div>
        
        <!-- Artist profile info -->
        <div class="flex-v-center t-white  pos-absolute pos-b-0 pos-l-0 w-100 pd-medium z-index-1 flex mobile:flex-column mobile:flex-h-center">
          <div class="w-15r h-15r radius-medium o-hidden mn-r-medium bs-black mobile:mn-r-0 mobile:mn-b-medium">
            <img
              v-if="artist.photoUrl"
              :src="FILE_SERVER_URL + artist.photoUrl"
              alt="Artist photo"
              class="w-100 h-100 object-fit-cover"
            />
            <div v-else class="w-100 h-100 bg-white flex-center flex">
              <span class="h1">{{ artist.name[0] }}</span>
            </div>
          </div>
          
          <div class=" mobile:t-center">
            <div class="flex-v-center flex-nowrap flex mn-b-small mobile:flex-center">
              <h1 class="h1 mn-r-small">{{ artist.name }}</h1>
              <span v-if="artist.isVerified" class="bg-main-nano pd-micro radius-small">
                ✓ Verified
              </span>
            </div>
            
            <p v-if="artist.location" class="p-medium mn-b-small">{{ artist.location }}</p>
            
            <!-- Social media links -->
            <div class="flex flex-nowrap gap-small mobile:flex-center">
              <a 
                v-if="artist.socials.telegram" 
                :href="`https://t.me/${artist.socials.telegram}`" 
                target="_blank"
                class="bg-white t-black flex-center flex w-2r h-2r radius-extra"
              >
                <span>T</span>
              </a>
              
              <a 
                v-if="artist.socials.twitter" 
                :href="`https://twitter.com/${artist.socials.twitter}`" 
                target="_blank"
                class="bg-white t-black flex-center flex w-2r h-2r radius-extra"
              >
                <span>𝕏</span>
              </a>
              
              <a 
                v-if="artist.socials.instagram" 
                :href="`https://instagram.com/${artist.socials.instagram}`" 
                target="_blank"
                class="bg-white t-black flex-center flex w-2r h-2r radius-extra"
              >
                <span>I</span>
              </a>
              
              <a 
                v-if="artist.socials.facebook" 
                :href="`https://facebook.com/${artist.socials.facebook}`" 
                target="_blank"
                class="bg-white t-black flex-center flex w-2r h-2r radius-extra"
              >
                <span>F</span>
              </a>
              
              <a 
                v-if="artist.website" 
                :href="artist.website" 
                target="_blank"
                class="bg-white t-black flex-center flex w-2r h-2r radius-extra"
              >
                <span>W</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main content -->
      <div class="pd-medium">
        <div class="cols-2-1_2 gap-medium mobile:cols-1">
          <!-- Left column - Bio and details -->
          <div>
            <div class="bg-light pd-medium radius-medium mn-b-medium">
              <h2 class="h3 mn-b-small">Biography</h2>
              <p v-if="artist.bio" class="p-medium">{{ artist.bio }}</p>
              <p v-else class="p-medium t-transp">No biography available for this artist.</p>
            </div>
            
            <!-- Genres -->
            <div v-if="genres.length > 0" class="bg-light pd-medium radius-medium">
              <h2 class="h3 mn-b-small">Genres</h2>
              <div class="flex flex-wrap gap-small">
                <span 
                  v-for="genre in genres" 
                  :key="genre._id"
                  class="bg-white pd-thin radius-medium"
                >
                  {{ genre.name }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Right column - Discography -->
          <div>
            <!-- Albums section -->
            <div v-if="discography.albums.length > 0" class="bg-light pd-medium radius-medium mn-b-medium">
              <h2 class="h3 mn-b-medium">Albums</h2>
              
              <div class="cols-2 gap-small mobile:cols-1">
                <div
                  v-for="album in discography.albums"
                  :key="album._id"
                  class="bg-white pd-small radius-medium flex-v-center flex cursor-pointer hover-bg-white"
                  @click="navigateToAlbum(album)"
                >
                  <div class="w-3r h-3r radius-small o-hidden mn-r-small">
                    <img
                      v-if="album.coverUrl"
                      :src="FILE_SERVER_URL + album.coverUrl"
                      alt="Album cover"
                      class="w-100 h-100 object-fit-cover"
                    />
                    <div v-else class="w-100 h-100 bg-light flex-center flex">
                      <span>A</span>
                    </div>
                  </div>
                  
                  <div class="w-100 o-hidden">
                    <p class="p-medium t-truncate">{{ album.title }}</p>
                    <p class="p-small t-transp">{{ formatDate(album.releaseDate) }}</p>
                  </div>
                </div>
              </div>
              
              <Button
                v-if="discography.albums.length > 4"
                :submit="viewAllAlbums"
                class="mn-t-small w-100 bg-white t-black"
                :showSucces="false"
                :showLoader="false"
              >
                View All Albums
              </Button>
            </div>
            
            <!-- Singles section -->
            <div v-if="discography.singles.length > 0" class="bg-light pd-medium radius-medium">
              <h2 class="h3 mn-b-medium">Singles & EPs</h2>
              
              <div class="cols-1 gap-small">
                <div
                  v-for="single in discography.singles"
                  :key="single._id"
                  class="bg-white pd-small radius-medium flex-v-center flex cursor-pointer hover-bg-white"
                  @click="navigateToTrack(single)"
                >
                  <div class="w-3r h-3r radius-small o-hidden mn-r-small">
                    <img
                      v-if="single.coverUrl"
                      :src="FILE_SERVER_URL + single.coverUrl"
                      alt="Single cover"
                      class="w-100 h-100 object-fit-cover"
                    />
                    <div v-else class="w-100 h-100 bg-light flex-center flex">
                      <span>S</span>
                    </div>
                  </div>
                  
                  <div class="w-100 o-hidden">
                    <p class="p-medium t-truncate">{{ single.title }}</p>
                    <p class="p-small t-transp">{{ formatDate(single.releaseDate) }}</p>
                  </div>
                </div>
              </div>
              
              <Button
                v-if="discography.singles.length > 5"
                :submit="viewAllSingles"
                class="mn-t-small w-100 bg-white t-black"
                :showSucces="false"
                :showLoader="false"
              >
                View All Singles & EPs
              </Button>
            </div>
            
            <!-- No discography yet -->
            <div 
              v-if="discography.albums.length === 0 && discography.singles.length === 0" 
              class="bg-light pd-medium radius-medium t-center"
            >
              <p class="p-medium mn-b-small">No releases yet</p>
              <p class="p-small t-transp">This artist hasn't released any albums or singles yet.</p>
              
              <Button
                v-if="isOwner"
                :submit="addRelease"
                class="mn-t-medium bg-main "
                :showSucces="false"
                :showLoader="false"
              >
                Add Release
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Related Artists -->
        <div v-if="relatedArtists.length > 0" class="mn-t-medium">
          <h2 class="h3 mn-b-medium">Fans Also Like</h2>
          
          <div class="cols-5 gap-medium mobile:cols-2">
            <div
              v-for="relatedArtist in relatedArtists"
              :key="relatedArtist._id"
              class="t-center cursor-pointer"
              @click="navigateToArtist(relatedArtist)"
            >
              <div class="w-100 aspect-1x1 radius-medium o-hidden mn-b-small">
                <img
                  v-if="relatedArtist.photoUrl"
                  :src="FILE_SERVER_URL + relatedArtist.photoUrl"
                  alt="Artist photo"
                  class="w-100 h-100 object-fit-cover"
                />
                <div v-else class="w-100 h-100 bg-light flex-center flex">
                  <span>{{ relatedArtist.name[0] }}</span>
                </div>
              </div>
              
              <p class="p-medium t-truncate">{{ relatedArtist.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Import Martyrs components
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';

// Import store
import * as artistsStore from '../../store/artists';
// import * as genreStore from '../../store/genres'; // Assuming you have a genre store
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';

// Import mixins
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
const { formatDate } = useGlobalMixins();

// Router and route
const router = useRouter();
const route = useRoute();

// State
const isLoading = ref(true);
const genres = ref([]);

// Computed
const artist = computed(() => {
  return artistsStore.state.currentArtist;
});

const discography = computed(() => {
  return artistsStore.state.discography;
});

const relatedArtists = computed(() => {
  return artistsStore.state.relatedArtists;
});

const isOwner = computed(() => {
  if (!artist.value || !auth.state.user._id) return false;
  
  // Check if current user is the creator of the artist
  return artist.value.creator?.target?._id === auth.state.user._id;
});

// Methods
const fetchArtist = async () => {
  isLoading.value = true;
  try {
    // Get URL from route params
    const url = route.params.url;
    if (!url) {
      throw new Error('Artist URL is required');
    }
    
    await artistsStore.actions.fetchArtistByUrl(url);
    
    // Fetch genre details if we have genre IDs
    if (artist.value?.genre && artist.value.genre.length > 0) {
      await fetchGenres();
    }
  } catch (error) {
    console.error('Error fetching artist:', error);
    globals.actions.setError({
      message: 'Failed to load artist'
    });
  } finally {
    isLoading.value = false;
  }
};

const fetchGenres = async () => {
  try {
    // Assuming genreStore has a method to fetch multiple genres by IDs
    // const fetchedGenres = await genreStore.actions.fetchGenresByIds(artist.value.genre);
    // genres.value = fetchedGenres;
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
};

const editArtist = () => {
  router.push({
    name: 'artist-edit',
    params: { url: artist.value.url }
  });
};

const manageContent = () => {
  // Navigate to a page for managing artist content (albums, tracks, etc.)
  router.push({
    name: 'artist-manage-content',
    params: { artistId: artist.value._id }
  });
};

const navigateToAlbum = (album) => {
  router.push({
    name: 'album',
    params: { url: album.url }
  });
};

const navigateToTrack = (track) => {
  router.push({
    name: 'track',
    params: { url: track.url }
  });
};

const navigateToArtist = (artist) => {
  router.push({
    name: 'artist',
    params: { url: artist.url }
  });
};

const viewAllAlbums = () => {
  router.push({
    name: 'artist-albums',
    params: { artistId: artist.value._id }
  });
};

const viewAllSingles = () => {
  router.push({
    name: 'artist-singles',
    params: { artistId: artist.value._id }
  });
};

const addRelease = () => {
  router.push({
    name: 'release-create',
    query: { artistId: artist.value._id }
  });
};

// Lifecycle hooks
onMounted(async () => {
  await fetchArtist();
});
</script>