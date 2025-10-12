<template>
  <div class="pd-medium">
    <h2 class="h2 mn-b-medium">{{ editMode ? 'Edit Artist' : 'Create Artist' }}</h2>
    
    <form @submit.prevent="submitForm" class="cols-1 gap-regular">
      <!-- Basic Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Basic Information</h3>
        
        <div class="cols-2 mobile:cols-1 gap-regular">
          <!-- Artist Photo -->
          <div>
            <p class="p-medium mn-b-small">Artist Photo</p>
            <UploadImage
              v-model:photo="artist.photoUrl"
              uploadPath="artists/photos"
              class="w-100 h-15r radius-small o-hidden mn-b-small"
              @error="handleUploadError"
            />
          </div>
          
          <!-- Artist Cover -->
          <div>
            <p class="p-medium mn-b-small">Cover Image</p>
            <UploadImage
              v-model:photo="artist.coverUrl"
              uploadPath="artists/covers"
              class="w-100 h-15r radius-small o-hidden mn-b-small"
              @error="handleUploadError"
            />
          </div>
        </div>
        
        <!-- Name -->
        <Field
          v-model:field="artist.name"
          label="Name"
          placeholder="Enter artist name"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.name"
        />
          <!-- URL -->
        <Field
          v-model:field="artist.url"
          label="URL"
          placeholder="Leave blank for auto-generation based on the artist name"
          class="bg-white radius-small pd-small  mn-b-small"
        />
        
        <!-- Bio -->
        <Field
          v-model:field="artist.bio"
          label="Biography"
          type="textarea"
          placeholder="Enter artist biography"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.bio"
        />
        
        <!-- Location -->
        <Field
          v-model:field="artist.location"
          label="Location"
          placeholder="e.g., Los Angeles, CA"
          class="bg-white radius-small pd-small mn-b-thin"
        />
        
        <!-- Website -->
        <Field
          v-model:field="artist.website"
          label="Website"
          placeholder="https://example.com"
          class="bg-white radius-small pd-small mn-b-thin"
        />
        
      
      </div>
      
      <!-- Social Media Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Social Media</h3>
        
        <div class="cols-2 mobile:cols-1 gap-thin">
          <!-- Telegram -->
          <Field
            v-model:field="artist.socials.telegram"
            label="Telegram"
            placeholder="@username"
            class="bg-white radius-small pd-small"
          />
          
          <!-- Twitter -->
          <Field
            v-model:field="artist.socials.twitter"
            label="Twitter"
            placeholder="@username"
            class="bg-white radius-small pd-small"
          />
          
          <!-- Facebook -->
          <Field
            v-model:field="artist.socials.facebook"
            label="Facebook"
            placeholder="username or page-name"
            class="bg-white radius-small pd-small"
          />
          
          <!-- Instagram -->
          <Field
            v-model:field="artist.socials.instagram"
            label="Instagram"
            placeholder="@username"
            class="bg-white radius-small pd-small"
          />
        </div>
      </div>
      
      <!-- Genres Section (assuming genres are available) -->
       <Block title="Genres">
        <BlockMultiselect
          v-model="artist.genres"
          placeholder="Search genres..."
          :multiple="true"
          :transform="(item) => ({ _id: item._id, name: item.name })"
          :store="{
            read: (options) => genresStore.actions.fetchGenres(options),
            state: genresStore.state
          }"
          :options="{
            rootOnly: false,
            excludeChildren: false,
            limit: 50
          }"
          :skeleton="{
            hide: false,
            horizontal: true,
            class: 'radius-small',
            structure: [{ 
              block: 'text', size: 'large'
            }]
          }"
          :states="{
            empty: {
              title: 'No genres found',
              description: 'Try different search terms or create a new genre',
              class: 'radius-small'
            }
          }"
          key="_id"
          :label="item => item.name"
          classSearch="bg-white radius-small"
          classSelected="bg-white pd-small radius-small"
          classDropdown="bg-white pd-small radius-medium bs-small"
          classItem="pd-small radius-small hover-bg-light cursor-pointer"
          classFeed="h-max-30r gap-thin flex-column flex o-scroll"
        >
          <!-- Слот для выбранных жанров -->
          <template #selected="{ item, clear }">
            <div class="flex-nowrap flex-v-center flex gap-thin">
              <span class="t-medium">{{ item?.name || item }}</span>
              <button 
                @click.stop="clear"
                class="i-small pd-micro bg-red radius-extra flex-center flex aspect-1x1 hover-scale-1"
              >
                <IconCross class="i-micro fill-white" />
              </button>
            </div>
          </template>
          
          <!-- Слот для элементов в списке -->
          <template #item="{ item }">
            <div class="flex-nowrap flex-v-center flex">
              <div class="w-100">
                <p class="t-medium">{{ item.name }}</p>
                <p v-if="item.description" class="t-small t-transp">{{ item.description }}</p>
              </div>
            </div>
          </template>
        </BlockMultiselect>
      </Block>
      
      <!-- Status Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Publishing Status</h3>
        
        <Select
          v-model:select="artist.status"
          :options="statusOptions"
          label="Status"
          class="bg-white radius-small pd-small mn-b-thin"
        />
        
        <Checkbox
          v-model:active="artist.isVerified"
          label="Verified Artist"
          class="bg-white radius-small pd-small mn-b-thin"
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
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Import Martyrs components
import Field from '@martyrs/src/components/Field/Field.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';


import BlockMultiselect from '@martyrs/src/modules/core/views/components/blocks/BlockMultiselect.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

// Import store
import * as artistsStore from '../../store/artists';
import * as genresStore from '../../store/genres';
import * as core from '@martyrs/src/modules/core/views/store/core.store.js';
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
  genres: []
});

const validation = reactive({
  name: false,
  bio: false
});

// Track if URL was manually entered
const urlManuallySet = ref(false);

// Function to generate URL-friendly slug from text
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

// Watch for changes in artist name to auto-generate URL
watch(() => artist.name, (newName) => {
  // Only auto-generate if URL hasn't been manually set and we're not in edit mode
  if (!urlManuallySet.value && !props.editMode) {
    artist.url = generateSlug(newName);
  }
});

// Watch for manual changes to URL field
watch(() => artist.url, (newUrl, oldUrl) => {
  // If user manually changes URL, mark as manually set
  if (newUrl !== generateSlug(artist.name)) {
    urlManuallySet.value = true;
  }
});

// Status options
const statusOptions = [
  'draft',
  'published',
  'archived'
];


const fetchArtist = async () => {
  if (!props.url) return;
  
  try {
    const fetchedArtist = await artistsStore.actions.fetchArtistByUrl(props.url);
    
    if (!fetchedArtist) {
      core.actions.setError({
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
      genres: fetchedArtist.genres || [],
      _id: fetchedArtist._id,
      socials: {
        telegram: fetchedArtist.socials?.telegram || '',
        twitter: fetchedArtist.socials?.twitter || '',
        facebook: fetchedArtist.socials?.facebook || '',
        instagram: fetchedArtist.socials?.instagram || ''
      }
    });
    
  } catch (error) {
    console.error('Error fetching artist:', error);
    core.actions.setError({
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
      genres: artist.genres.map(genre => genre._id || genre)
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
        name: 'artist',
        params: { url: result.url }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error saving artist:', error);
    core.actions.setError({
      message: 'Failed to save artist'
    });
  }
};

const handleUploadError = (error) => {
  console.error('Upload error:', error);
  core.actions.setError({
    message: 'Error uploading image'
  });
};

// Lifecycle hooks
onMounted(async () => {
  if (props.editMode) {
    await fetchArtist();
    // Mark URL as manually set in edit mode to prevent auto-generation
    urlManuallySet.value = true;
  }
});
</script>