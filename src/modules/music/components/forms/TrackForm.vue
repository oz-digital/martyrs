<!-- components/forms/TrackForm.vue -->
<template>
  <div class="pd-medium">
    <h2 class="h2 mn-b-medium">{{ editMode ? 'Edit Track' : 'Upload Track' }}</h2>
    
    <form @submit.prevent="submitForm" class="cols-1 gap-medium">
      <!-- Basic Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Basic Information</h3>
        
        <!-- Track Title -->
        <Field
          v-model:field="form.title"
          label="Track Title"
          placeholder="Enter track title"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validationErrors.title"
        />
        
        <!-- URL -->
        <Field
          v-model:field="form.url"
          label="URL"
          placeholder="Leave blank for auto-generation based on the track title"
          class="bg-white radius-small pd-small mn-b-small"
        />

        <!-- Artist Selection -->
       

     
        
        <!-- Release Date -->
        <Field
          v-model:field="form.releaseDate"
          label="Release Date"
          type="date"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validationErrors.releaseDate"
        />
      
        <!-- Duration -->
        <Field
          v-model:field="form.duration"
          label="Duration (seconds)"
          type="number"
          placeholder="Track duration in seconds"
          class="bg-white radius-small pd-small mn-b-thin"
        />
      </div>  

         <Block title="Artist">
          <BlockMultiselect
            v-model="form.artists"
            placeholder="Search artists..."
            :multiple="false"
            :transform="(item) => ({ _id: item._id, name: item.name })"
            :store="{
              read: (options) => artistsActions.fetchArtists(options),
              state: artistsState
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
            <!-- Selected artist slot -->
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
            
            <!-- Artist item slot -->
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

         <!-- Album Selection -->
        <Block title="Album (Optional)">
          <BlockMultiselect
            v-model="form.albums"
            placeholder="Search albums..."
            :multiple="false"
            :transform="(item) => ({ _id: item._id, title: item.title })"
            :store="{
              read: (options) => albumsActions.fetchAlbums(options),
              state: albumsState
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
                title: 'No albums found',
                description: 'Try different search terms or create a new album',
                class: 'radius-small'
              }
            }"
            key="_id"
            :label="item => item.title"
            classSearch="bg-white radius-small"
            classSelected="bg-white pd-small radius-small"
            classDropdown="bg-white pd-small radius-medium bs-small"
            classItem="pd-small radius-small hover-bg-light cursor-pointer"
            classFeed="h-max-30r gap-thin flex-column flex o-scroll"
          >
            <!-- Selected album slot -->
            <template #selected="{ item, clear }">
              <div class="flex-nowrap flex-v-center flex gap-thin">
                <span class="t-medium">{{ item?.title || item }}</span>
                <button 
                  @click.stop="clear"
                  class="i-small pd-micro bg-red radius-extra flex-center flex aspect-1x1 hover-scale-1"
                >
                  <IconCross class="i-micro fill-white" />
                </button>
              </div>
            </template>
            
            <!-- Album item slot -->
            <template #item="{ item }">
              <div class="flex-nowrap flex-v-center flex">
                <div class="w-100">
                  <p class="t-medium">{{ item.title }}</p>
                  <p v-if="item.description" class="t-small t-transp">{{ item.description }}</p>
                </div>
              </div>
            </template>
          </BlockMultiselect>
        </Block>
      
      <!-- Genres Section -->
      <Block title="Genres">
        <BlockMultiselect
          v-model="form.genres"
          placeholder="Search genres..."
          :multiple="true"
          :transform="(item) => ({ _id: item._id, name: item.name })"
          :store="{
            read: (options) => genresActions.fetchGenres(options),
            state: genresState
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
          <!-- Selected genres slot -->
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
          
          <!-- Genre item slot -->
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
      
      <!-- Content Settings Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Content Settings</h3>
        
        <Checkbox
          v-model:checkbox="form.isExplicit"
          label="Explicit Content"
          class="bg-white radius-small pd-small mn-b-thin"
        />
        
        <Checkbox
          v-model:checkbox="form.isPublic"
          label="Public Track"
          class="bg-white radius-small pd-small mn-b-thin"
        />
      </div>
      
      <!-- Media Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Media</h3>
        
        <div class="cols-2 mobile:cols-1 gap-medium">
          <!-- Track Cover -->
          <div>
            <p class="p-semi mn-b-small">Cover Image</p>
            <UploadImage
              v-model:photo="form.coverUrl"
              uploadPath="tracks/covers"
              class="w-100 h-15r radius-small o-hidden mn-b-small"
              @error="handleUploadError"
            />
          </div>
          
          <!-- Audio File -->
          <div>
            <p class="p-semi mn-b-small">Audio File</p>
            <Upload
              v-model:field="form.fileUrl"
              @file-change="(url) => form.fileUrl = url"
              type="file"
              uploadPath="tracks/audio"
              class="w-100 h-15r bg-white radius-small pd-small"
              :validation="validationErrors.fileUrl"
            />
          </div>
        </div>
      </div>
      
      <!-- Additional Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Additional Information</h3>
        
        <!-- Lyrics -->
        <Field
          v-model:field="form.lyrics"
          label="Lyrics (Optional)"
          type="textarea"
          placeholder="Enter track lyrics"
          class="bg-white radius-small pd-small mn-b-thin"
        />
      </div>
      
      <!-- Status Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Publishing Status</h3>
        
        <Select
          v-model:select="form.status"
          :options="statusOptions"
          label="Status"
          class="bg-white radius-small pd-small mn-b-thin"
        />
      </div>
      
      <!-- Submit Button -->
      <div class="flex flex-justify-between">
        <Button
          @click="router.go(-1)"
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
            success: editMode ? 'Updated!' : 'Uploaded!'
          }"
        >
          {{ editMode ? 'Update Track' : 'Upload Track' }}
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
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Upload from '@martyrs/src/components/Upload/Upload.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

import BlockMultiselect from '@martyrs/src/modules/globals/views/components/blocks/BlockMultiselect.vue';

// Import stores
import * as tracksStore from '../../store/tracks';
import * as artistsStore from '../../store/artists';
import * as albumsStore from '../../store/albums';
import * as genresStore from '../../store/genres';
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

// Store states and actions
const { state: artistsState, actions: artistsActions } = artistsStore;
const { state: albumsState, actions: albumsActions } = albumsStore;
const { state: genresState, actions: genresActions } = genresStore;

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

const emit = defineEmits(['uploaded']);

// State
const form = reactive({
  title: '',
  artists: [],
  albums: [],
  genres: [],
  duration: 0,
  fileUrl: '',
  coverUrl: '',
  releaseDate: new Date().toISOString().split('T')[0],
  isExplicit: false,
  isPublic: true,
  lyrics: '',
  url: '',
  status: 'draft'
});

const validationErrors = reactive({
  title: false,
  fileUrl: false,
  releaseDate: false
});

// Track if URL was manually entered
const urlManuallySet = ref(false);

// Status options
const statusOptions = [
  'draft',
  'published',
  'archived'
];

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

// Watch for changes in track title to auto-generate URL
watch(() => form.title, (newTitle) => {
  // Only auto-generate if URL hasn't been manually set and we're not in edit mode
  if (!urlManuallySet.value && !props.editMode) {
    form.url = generateSlug(newTitle);
  }
});

// Watch for manual changes to URL field
watch(() => form.url, (newUrl, oldUrl) => {
  // If user manually changes URL, mark as manually set
  if (newUrl !== generateSlug(form.title)) {
    urlManuallySet.value = true;
  }
});

const fetchTrack = async () => {
  if (!props.url) return;
  
  try {
    const fetchedTrack = await tracksStore.actions.fetchTrackByUrl(props.url);
    
    if (!fetchedTrack) {
      globals.actions.setError({
        message: 'Track not found'
      });
      return;
    }
    
    // Update local track data
    Object.assign(form, {
      title: fetchedTrack.title || '',
      artists: fetchedTrack.artist ? [fetchedTrack.artist] : [],
      albums: fetchedTrack.album ? [fetchedTrack.album] : [],
      genres: fetchedTrack.genres || [],
      duration: fetchedTrack.duration || 0,
      fileUrl: fetchedTrack.fileUrl || '',
      coverUrl: fetchedTrack.coverUrl || '',
      releaseDate: fetchedTrack.releaseDate ? new Date(fetchedTrack.releaseDate).toISOString().split('T')[0] : '',
      isExplicit: fetchedTrack.isExplicit || false,
      isPublic: fetchedTrack.isPublic !== false,
      lyrics: fetchedTrack.lyrics || '',
      url: fetchedTrack.url || '',
      status: fetchedTrack.status || 'draft',
      _id: fetchedTrack._id
    });
    
  } catch (error) {
    console.error('Error fetching track:', error);
    globals.actions.setError({
      message: 'Failed to load track details'
    });
  }
};

const validateForm = () => {
  let isValid = true;
  
  // Validate title
  if (!form.title.trim()) {
    validationErrors.title = {
      message: 'Track title is required'
    };
    isValid = false;
  } else {
    validationErrors.title = false;
  }
  
  // Validate file URL
  if (!form.fileUrl) {
    validationErrors.fileUrl = {
      message: 'Audio file is required'
    };
    isValid = false;
  } else {
    validationErrors.fileUrl = false;
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
      ...form,
      artist: form.artists.length > 0 ? (form.artists[0]._id || form.artists[0]) : null,
      album: form.albums.length > 0 ? (form.albums[0]._id || form.albums[0]) : null,
      genres: form.genres.map(genre => genre._id || genre)
    };
    
    // Add ownership data if creating new track
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
      result = await tracksStore.actions.updateTrack(formData);
    } else {
      result = await tracksStore.actions.createTrack(formData);
    }
    
    // Navigate to track detail page
    setTimeout(() => {
      router.push({
        name: 'track',
        params: { url: result.url }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error saving track:', error);
    globals.actions.setError({
      message: 'Failed to save track'
    });
  }
};
const handleUploadError = (error) => {
  console.error('Upload error:', error);
  globals.actions.setError({
    message: 'Error uploading file'
  });
};

// Lifecycle hooks
onMounted(async () => {
  if (props.editMode) {
    await fetchTrack();
    // Mark URL as manually set in edit mode to prevent auto-generation
    urlManuallySet.value = true;
  }
});
</script>