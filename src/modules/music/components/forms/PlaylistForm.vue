<template>
  <div class="pd-medium">
    <h2 class="h2 mn-b-medium">{{ editMode ? 'Edit Playlist' : 'Create Playlist' }}</h2>
    
    <form @submit.prevent="submitForm" class="cols-1 gap-regular">
      <!-- Basic Info Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Basic Information</h3>
        
        <!-- Playlist Cover -->
        <div class="mn-b-medium">
          <p class="p-medium mn-b-small">Playlist Cover</p>
          <UploadImage
            v-model:photo="playlist.coverUrl"
            uploadPath="playlists/covers"
            class="w-100 h-15r radius-small o-hidden mn-b-small"
            @error="handleUploadError"
          />
        </div>
        
        <!-- Title -->
        <Field
          v-model:field="playlist.title"
          label="Title"
          placeholder="Enter playlist title"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.title"
        />
        
        <!-- URL -->
        <Field
          v-model:field="playlist.url"
          label="URL"
          placeholder="Leave blank for auto-generation based on the playlist title"
          class="bg-white radius-small pd-small mn-b-small"
        />
        
        <!-- Description -->
        <Field
          v-model:field="playlist.description"
          label="Description"
          type="textarea"
          placeholder="Enter playlist description"
          class="bg-white radius-small pd-small mn-b-thin"
          :validation="validation.description"
        />
      </div>
      
      <!-- Tracks Section -->
      <Block title="Tracks">
        <BlockMultiselect
          v-model="playlist.tracks"
          placeholder="Search tracks..."
          :multiple="true"
          :transform="(item) => ({ 
            _id: item._id, 
            title: item.title,
            artists: item.artists,
            album: item.album,
            duration: item.duration 
          })"
          :store="{
            read: (options) => tracksStore.actions.fetchTracks(options),
            state: tracksStore.state
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
              title: 'No tracks found',
              description: 'Try different search terms',
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
          <!-- Selected tracks with reorder support -->
          <template #selected="{ item, clear, index }">
            <div class="flex-nowrap flex-v-center flex gap-thin">
              <button 
                v-if="playlist.tracks.length > 1"
                @click.stop="moveTrack(index, 'up')"
                :disabled="index === 0"
                class="i-small pd-micro bg-grey-nano radius-extra flex-center flex aspect-1x1 hover-scale-1"
              >
                <IconArrowUp class="i-micro" />
              </button>
              
              <button 
                v-if="playlist.tracks.length > 1"
                @click.stop="moveTrack(index, 'down')"
                :disabled="index === playlist.tracks.length - 1"
                class="i-small pd-micro bg-grey-nano radius-extra flex-center flex aspect-1x1 hover-scale-1"
              >
                <IconArrowDown class="i-micro" />
              </button>
              
              <div class="flex-1">
                <p class="t-medium">{{ item.title }}</p>
                <p class="t-small t-transp">
                  {{ item.artists?.map(a => a.name || a).join(', ') }}
                  <span v-if="item.album"> • {{ item.album.title || item.album }}</span>
                </p>
              </div>
              
              <span v-if="item.duration" class="t-small t-transp">
                {{ formatDuration(item.duration) }}
              </span>
              
              <button 
                @click.stop="clear"
                class="i-small pd-micro bg-red radius-extra flex-center flex aspect-1x1 hover-scale-1"
              >
                <IconCross class="i-micro fill-white" />
              </button>
            </div>
          </template>
          
          <!-- Track items in dropdown -->
          <template #item="{ item }">
            <div class="flex-nowrap flex-v-center flex">
              <div class="w-100">
                <p class="t-medium">{{ item.title }}</p>
                <p class="t-small t-transp">
                  {{ item.artists?.map(a => a.name || a).join(', ') }}
                  <span v-if="item.album"> • {{ item.album.title || item.album }}</span>
                </p>
              </div>
              <span v-if="item.duration" class="t-small t-transp mn-l-small">
                {{ formatDuration(item.duration) }}
              </span>
            </div>
          </template>
        </BlockMultiselect>
        
        <!-- Tracks summary -->
        <div v-if="playlist.tracks.length > 0" class="t-small t-transp mn-t-small">
          {{ playlist.tracks.length }} tracks • {{ formatDuration(totalDuration) }}
        </div>
      </Block>
      
      <!-- Privacy & Settings Section -->
      <div class="bg-light pd-medium radius-medium">
        <h3 class="h3 mn-b-medium">Privacy & Settings</h3>
        
        <!-- Privacy -->
        <div class="mn-b-medium">
          <p class="p-medium mn-b-small">Privacy</p>
          <div class="flex gap-regular">
            <Radio
              v-model:radio="playlist.isPublic"
              :value="true"
              name="privacy"
              label="Public"
              class="bg-white pd-small radius-small"
            />
            <Radio
              v-model:radio="playlist.isPublic"
              :value="false"
              name="privacy"
              label="Private"
              class="bg-white pd-small radius-small"
            />
          </div>
        </div>
        
        <!-- Collaborative -->
        <div class="mn-b-medium">
          <p class="p-medium mn-b-small">Collaborative Playlist</p>
          <div class="flex gap-regular">
            <Radio
              v-model:radio="playlist.isCollaborative"
              :value="true"
              name="collaborative"
              label="Yes"
              class="bg-white pd-small radius-small"
            />
            <Radio
              v-model:radio="playlist.isCollaborative"
              :value="false"
              name="collaborative"
              label="No"
              class="bg-white pd-small radius-small"
            />
          </div>
        </div>
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
          {{ editMode ? 'Update Playlist' : 'Create Playlist' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Import Martyrs components
import Field from '@martyrs/src/components/Field/Field.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Radio from '@martyrs/src/components/Radio/Radio.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';
import IconArrowUp from '@martyrs/src/modules/icons/navigation/IconCross.vue';
import IconArrowDown from '@martyrs/src/modules/icons/navigation/IconCross.vue';

import BlockMultiselect from '@martyrs/src/modules/core/views/components/blocks/BlockMultiselect.vue';

// Import stores
import * as playlistsStore from '../../store/playlists';
import * as tracksStore from '../../store/tracks';
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
const playlist = reactive({
  title: '',
  description: '',
  coverUrl: '',
  tracks: [],
  url: '',
  isPublic: true,
  isCollaborative: false
});

const validation = reactive({
  title: false,
  description: false
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

// Watch for changes in playlist title to auto-generate URL
watch(() => playlist.title, (newTitle) => {
  // Only auto-generate if URL hasn't been manually set and we're not in edit mode
  if (!urlManuallySet.value && !props.editMode) {
    playlist.url = generateSlug(newTitle);
  }
});

// Watch for manual changes to URL field
watch(() => playlist.url, (newUrl, oldUrl) => {
  // If user manually changes URL, mark as manually set
  if (newUrl !== generateSlug(playlist.title)) {
    urlManuallySet.value = true;
  }
});

// Computed
const totalDuration = computed(() => {
  return playlist.tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
});

// Methods
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const moveTrack = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= playlist.tracks.length) return;
  
  const tracks = [...playlist.tracks];
  [tracks[index], tracks[newIndex]] = [tracks[newIndex], tracks[index]];
  playlist.tracks = tracks;
};

const fetchPlaylist = async () => {
  if (!props.url) return;
  
  try {
    const fetchedPlaylist = await playlistsStore.actions.fetchPlaylistByUrl(props.url);
    
    if (!fetchedPlaylist) {
      core.actions.setError({
        message: 'Playlist not found'
      });
      return;
    }
    
    // Update local playlist data
    Object.assign(playlist, {
      title: fetchedPlaylist.title || '',
      description: fetchedPlaylist.description || '',
      coverUrl: fetchedPlaylist.coverUrl || '',
      tracks: fetchedPlaylist.tracks || [],
      url: fetchedPlaylist.url || '',
      isPublic: fetchedPlaylist.isPublic !== false,
      isCollaborative: fetchedPlaylist.isCollaborative || false,
      _id: fetchedPlaylist._id
    });
    
  } catch (error) {
    console.error('Error fetching playlist:', error);
    core.actions.setError({
      message: 'Failed to load playlist details'
    });
  }
};

const validateForm = () => {
  let isValid = true;
  
  // Validate title
  if (!playlist.title.trim()) {
    validation.title = {
      message: 'Playlist title is required'
    };
    isValid = false;
  } else {
    validation.title = false;
  }
  
  // Validate description
  if (playlist.description && playlist.description.length > 2000) {
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
      ...playlist,
      tracks: playlist.tracks.map(track => ({
        track: track._id || track,
        addedAt: new Date()
      }))
    };
    
    // Add ownership data if creating new playlist
    if (!props.editMode) {
      formData.creator = {
        type: 'user',
        target: auth.state.user._id
      };
      formData.owner = {
        type: 'user',
        target: auth.state.user._id
      };
    }
    
    let result;
    if (props.editMode) {
      result = await playlistsStore.actions.updatePlaylist(formData);
    } else {
      result = await playlistsStore.actions.createPlaylist(formData);
    }
    
    // Navigate to playlist detail page
    setTimeout(() => {
      router.push({
        name: 'playlist',
        params: { url: result.url }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error saving playlist:', error);
    core.actions.setError({
      message: 'Failed to save playlist'
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
    await fetchPlaylist();
    // Mark URL as manually set in edit mode to prevent auto-generation
    urlManuallySet.value = true;
  }
});
</script>