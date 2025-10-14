<template>
  <div class="pd-medium">
    <h2 class="h2 mn-b-medium">{{ editMode ? 'Edit Album' : 'Create Album' }}</h2>
    
    <form @submit.prevent="submitForm" class="cols-1 gap-regular">
      <!-- Basic Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Basic Information</h3>
        
        <!-- Album Cover -->
        <div class="mn-b-medium">
          <p class="p-medium mn-b-small">Album Cover</p>
          <UploadImage
            v-model:photo="album.coverArt"
            uploadPath="albums/covers"
            class="w-100 h-15r radius-small o-hidden mn-b-small"
            @error="handleUploadError"
          />
        </div>
        
        <!-- Title -->
        <Field
          v-model:field="album.title"
          label="Title"
          placeholder="Enter album title"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.title"
        />
        
        <!-- URL -->
        <Field
          v-model:field="album.url"
          label="URL"
          placeholder="Leave blank for auto-generation based on the album title"
          class="bg-white radius-small pd-small mn-b-small"
        />
        
        <!-- Description -->
        <Field
          v-model:field="album.description"
          label="Description"
          type="textarea"
          placeholder="Enter album description"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.description"
        />
        
        <!-- Release Date -->
        <Field
          v-model:field="album.releaseDate"
          label="Release Date"
          type="date"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.releaseDate"
        />
        
        <!-- Album Type -->
        <Select
          v-model:select="album.type"
          :options="albumTypeOptions"
          label="Album Type"
          class="bg-white radius-small pd-small mn-b-thin"
        />
      </div>
      
      <!-- Artists Section -->
      <Block title="Artists">
        <BlockMultiselect
          v-model="album.artists"
          placeholder="Search artists..."
          :multiple="true"
          :transform="(item) => ({ _id: item._id, name: item.name })"
          :store="{
            read: (options) => artistsStore.actions.fetchArtists(options),
            state: artistsStore.state
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
              title: 'No artists found',
              description: 'Try different search terms or create a new artist',
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
          <!-- Слот для выбранных артистов -->
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
                <p v-if="item.bio" class="t-small t-transp">{{ item.bio }}</p>
              </div>
            </div>
          </template>
        </BlockMultiselect>
      </Block>
      
      <!-- Genres Section -->
      <Block title="Genres">
        <BlockMultiselect
          v-model="album.genres"
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
          v-model:select="album.status"
          :options="statusOptions"
          label="Status"
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
          {{ editMode ? 'Update Album' : 'Create Album' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Import Martyrs components
import Field from '@martyrs/src/components/Field/Field.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

import BlockMultiselect from '@martyrs/src/modules/core/views/components/blocks/BlockMultiselect.vue';

// Import stores
import * as albumsStore from '../../store/albums';
import * as artistsStore from '../../store/artists';
import * as genresStore from '../../store/genres';
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';

const store = useStore();
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
const album = reactive({
  title: '',
  description: '',
  releaseDate: new Date().toISOString().split('T')[0],
  coverArt: '',
  artists: [],
  type: 'album',
  genres: [],
  totalTracks: 0,
  url: '',
  status: 'draft'
});

const validation = reactive({
  title: false,
  description: false,
  releaseDate: false
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

// Watch for changes in album title to auto-generate URL
watch(() => album.title, (newTitle) => {
  // Only auto-generate if URL hasn't been manually set and we're not in edit mode
  if (!urlManuallySet.value && !props.editMode) {
    album.url = generateSlug(newTitle);
  }
});

// Watch for manual changes to URL field
watch(() => album.url, (newUrl, oldUrl) => {
  // If user manually changes URL, mark as manually set
  if (newUrl !== generateSlug(album.title)) {
    urlManuallySet.value = true;
  }
});

// Options
const statusOptions = [
  'draft',
  'published',
  'archived'
];

const albumTypeOptions = [
  'album',
  'single',
  'EP',
  'compilation'
];

const fetchAlbum = async () => {
  if (!props.url) return;
  
  try {
    const fetchedAlbum = await albumsStore.actions.fetchAlbumByUrl(props.url);
    
    if (!fetchedAlbum) {
      store.core.actions.setError({
        message: 'Album not found'
      });
      return;
    }
    
    // Update local album data
    Object.assign(album, {
      title: fetchedAlbum.title || '',
      description: fetchedAlbum.description || '',
      releaseDate: fetchedAlbum.releaseDate ? new Date(fetchedAlbum.releaseDate).toISOString().split('T')[0] : '',
      coverArt: fetchedAlbum.coverArt || '',
      artists: fetchedAlbum.artists || [],
      type: fetchedAlbum.type || 'album',
      genres: fetchedAlbum.genres || [],
      totalTracks: fetchedAlbum.totalTracks || 0,
      url: fetchedAlbum.url || '',
      status: fetchedAlbum.status || 'draft',
      _id: fetchedAlbum._id
    });
    
  } catch (error) {
    console.error('Error fetching album:', error);
    store.core.actions.setError({
      message: 'Failed to load album details'
    });
  }
};

const validateForm = () => {
  let isValid = true;
  
  // Validate title
  if (!album.title.trim()) {
    validation.title = {
      message: 'Album title is required'
    };
    isValid = false;
  } else {
    validation.title = false;
  }
  
  // Validate release date
  if (!album.releaseDate) {
    validation.releaseDate = {
      message: 'Release date is required'
    };
    isValid = false;
  } else {
    validation.releaseDate = false;
  }
  
  // Validate description
  if (album.description && album.description.length > 2000) {
    validation.description = {
      message: 'Description is too long (max 2000 characters)'
    };
    isValid = false;
  } else {
    validation.description = false;
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
      ...album,
      artists: album.artists.map(artist => artist._id || artist),
      genres: album.genres.map(genre => genre._id || genre)
    };
    
    // Add ownership data if creating new album
    if (!props.editMode) {
      formData.owner = {
        type: 'user',
        target: auth.state.user._id
      };
    }
    
    let result;
    if (props.editMode) {
      result = await albumsStore.actions.updateAlbum(formData);
    } else {
      result = await albumsStore.actions.createAlbum(formData);
    }
    
    // Navigate to album detail page
    setTimeout(() => {
      router.push({
        name: 'album',
        params: { url: result.url }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error saving album:', error);
    store.core.actions.setError({
      message: 'Failed to save album'
    });
  }
};

const handleUploadError = (error) => {
  console.error('Upload error:', error);
  store.core.actions.setError({
    message: 'Error uploading image'
  });
};

// Lifecycle hooks
onMounted(async () => {
  if (props.editMode) {
    await fetchAlbum();
    // Mark URL as manually set in edit mode to prevent auto-generation
    urlManuallySet.value = true;
  }
});
</script>
