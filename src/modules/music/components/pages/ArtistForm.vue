<template>
  <div class="pd-medium">
    <h2 class="h2 mn-b-medium">{{ editMode ? 'Edit Artist' : 'Create Artist' }}</h2>
    
    <form @submit.prevent="submitForm" class="cols-1 gap-medium">
      <!-- Basic Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Basic Information</h3>
        
        <div class="cols-2 mobile:cols-1 gap-medium">
          <!-- Artist Photo -->
          <div>
            <p class="p-semi mn-b-small">Artist Photo</p>
            <UploadImage
              v-model:photo="artist.photoUrl"
              uploadPath="artists/photos"
              class="w-100 h-15r mn-b-small"
              @error="handleUploadError"
            />
          </div>
          
          <!-- Artist Cover -->
          <div>
            <p class="p-semi mn-b-small">Cover Image</p>
            <UploadImage
              v-model:photo="artist.coverUrl"
              uploadPath="artists/covers"
              class="w-100 h-15r mn-b-small"
              @error="handleUploadError"
            />
          </div>
        </div>
        
        <!-- Name -->
        <Field
          v-model:field="artist.name"
          label="Artist Name"
          placeholder="Enter artist name"
          class="mn-b-medium"
          :validation="validation.name"
        />
        
        <!-- Bio -->
        <Field
          v-model:field="artist.bio"
          label="Biography"
          type="textarea"
          placeholder="Enter artist biography"
          class="mn-b-medium"
          :validation="validation.bio"
        />
        
        <!-- Location -->
        <Field
          v-model:field="artist.location"
          label="Location"
          placeholder="e.g., Los Angeles, CA"
          class="mn-b-medium"
        />
        
        <!-- Website -->
        <Field
          v-model:field="artist.website"
          label="Website"
          placeholder="https://example.com"
          class="mn-b-medium"
        />
        
        <!-- URL (if editable) -->
        <Field
          v-if="!artist.url && !editMode"
          v-model:field="artist.url"
          label="Custom URL"
          placeholder="custom-artist-url"
          class="mn-b-small"
        />
        <p v-if="!artist.url && !editMode" class="t-transp p-small mn-b-medium">
          Leave blank for auto-generation based on the artist name
        </p>
      </div>
      
      <!-- Social Media Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Social Media</h3>
        
        <div class="cols-2 mobile:cols-1 gap-medium">
          <!-- Telegram -->
          <Field
            v-model:field="artist.socials.telegram"
            label="Telegram"
            placeholder="@username"
            class="mn-b-medium"
          />
          
          <!-- Twitter -->
          <Field
            v-model:field="artist.socials.twitter"
            label="Twitter"
            placeholder="@username"
            class="mn-b-medium"
          />
          
          <!-- Facebook -->
          <Field
            v-model:field="artist.socials.facebook"
            label="Facebook"
            placeholder="username or page-name"
            class="mn-b-medium"
          />
          
          <!-- Instagram -->
          <Field
            v-model:field="artist.socials.instagram"
            label="Instagram"
            placeholder="@username"
            class="mn-b-medium"
          />
        </div>
      </div>
      
      <!-- Genres Section (assuming genres are available) -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Genres</h3>
        <p class="t-transp mn-b-medium">
          Select genres that best describe this artist
        </p>
        
        <div v-if="isLoadingGenres" class="flex-center flex">
          <Loader class="mn-b-medium" />
        </div>
        
        <div v-else class="flex flex-wrap gap-small mn-b-medium">
          <Checkbox
            v-for="genre in availableGenres"
            :key="genre._id"
            v-model:active="selectedGenres[genre._id]"
            :label="genre.name"
            class="pd-small bg-white radius-medium"
          />
        </div>
      </div>
      
      <!-- Status Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Publishing Status</h3>
        
        <Select
          v-model:select="artist.status"
          :options="statusOptions"
          label="Status"
          class="mn-b-medium w-m-20r"
        />
        
        <Checkbox
          v-model:active="artist.isVerified"
          label="Verified Artist"
          class="mn-b-medium"
        />
      </div>
      
      <!-- Submit Button -->
      <div class="flex flex-justify-between">
        <Button
          @click="$router.go(-1)"
          class="bg-grey-nano t-black"
          :showSucces="false"
          :showLoader="false"
        >
          Cancel
        </Button>
        
        <Button
          :submit="submitForm"
          class="bg-main t-black"
          :text="{
            success: editMode ? 'Updated!' : 'Created!'
          }"
        >
          {{ editMode ? 'Update Artist' : 'Create Artist' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Import Martyrs components
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';

// Import store
import * as artistsStore from '../../store/artists';
// import * as genreStore from '../../store/genres'; // Assuming you have a genre store
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

// Props
const props = defineProps({
  editMode: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  }
});

// Router and route
const router = useRouter();
const route = useRoute();

// State
const artist = reactive({
  name: '',
  bio: '',
  photoUrl: '',
  coverUrl: '',
  website: '',
  location: '',
  isVerified: false,
  status: 'draft',
  socials: {
    telegram: '',
    twitter: '',
    facebook: '',
    instagram: ''
  },
  url: '',
  genre: []
});

const validation = reactive({
  name: false,
  bio: false
});

// Status options
const statusOptions = [
  'draft',
  'published',
  'archived'
];

// Genres
const availableGenres = ref([]);
const selectedGenres = reactive({});
const isLoadingGenres = ref(false);

// Computed
const genreIds = computed(() => {
  return Object.keys(selectedGenres).filter(id => selectedGenres[id]);
});

// Methods
const fetchGenres = async () => {
  isLoadingGenres.value = true;
  try {
    // Assuming genreStore has a fetchGenres method
    // const genres = await genreStore.actions.fetchGenres();
    // availableGenres.value = genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    globals.actions.setError({
      message: 'Failed to load genres'
    });
  } finally {
    isLoadingGenres.value = false;
  }
};

const initializeSelectedGenres = (genreIds) => {
  if (!genreIds || !Array.isArray(genreIds)) return;
  
  // Reset selected genres
  for (const key in selectedGenres) {
    delete selectedGenres[key];
  }
  
  // Set selected genres based on artist's genres
  genreIds.forEach(id => {
    selectedGenres[id] = true;
  });
};

const fetchArtist = async () => {
  if (!props.url) return;
  
  try {
    const fetchedArtist = await artistsStore.actions.fetchArtistByUrl(props.url);
    
    if (!fetchedArtist) {
      globals.actions.setError({
        message: 'Artist not found'
      });
      return;
    }
    
    // Update local artist data
    Object.assign(artist, {
      name: fetchedArtist.name || '',
      bio: fetchedArtist.bio || '',
      photoUrl: fetchedArtist.photoUrl || '',
      coverUrl: fetchedArtist.coverUrl || '',
      website: fetchedArtist.website || '',
      location: fetchedArtist.location || '',
      isVerified: fetchedArtist.isVerified || false,
      status: fetchedArtist.status || 'draft',
      url: fetchedArtist.url || '',
      genre: fetchedArtist.genre || [],
      _id: fetchedArtist._id,
      socials: {
        telegram: fetchedArtist.socials?.telegram || '',
        twitter: fetchedArtist.socials?.twitter || '',
        facebook: fetchedArtist.socials?.facebook || '',
        instagram: fetchedArtist.socials?.instagram || ''
      }
    });
    
    // Initialize selected genres
    initializeSelectedGenres(fetchedArtist.genre);
    
  } catch (error) {
    console.error('Error fetching artist:', error);
    globals.actions.setError({
      message: 'Failed to load artist details'
    });
  }
};

const validateForm = () => {
  let isValid = true;
  
  // Validate name
  if (!artist.name.trim()) {
    validation.name = {
      message: 'Artist name is required'
    };
    isValid = false;
  } else {
    validation.name = false;
  }
  
  // Validate bio
  if (artist.bio && artist.bio.length > 2000) {
    validation.bio = {
      message: 'Biography is too long (max 2000 characters)'
    };
    isValid = false;
  } else {
    validation.bio = false;
  }
  
  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    // Prepare data for submission
    const formData = {
      ...artist,
      genre: genreIds.value
    };
    
    // Add ownership data if creating new artist
    if (!props.editMode) {
      formData.owner = {
        type: 'user',
        target: auth.state.user._id
      };
      formData.creator = {
        type: 'user',
        target: auth.state.user._id
      };
    }
    
    let result;
    if (props.editMode) {
      result = await artistsStore.actions.updateArtist(formData);
    } else {
      result = await artistsStore.actions.createArtist(formData);
    }
    
    // Navigate to artist detail page
    setTimeout(() => {
      router.push({
        name: 'artist-detail',
        params: { url: result.url }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error saving artist:', error);
    globals.actions.setError({
      message: 'Failed to save artist'
    });
  }
};

const handleUploadError = (error) => {
  console.error('Upload error:', error);
  globals.actions.setError({
    message: 'Error uploading image'
  });
};

// Lifecycle hooks
onMounted(async () => {
  await fetchGenres();
  
  if (props.editMode) {
    await fetchArtist();
  }
});
</script>