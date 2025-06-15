<!-- components/forms/PlaylistForm.vue -->
<template>
  <div class="playlist-form">
    <form @submit.prevent="submitForm">
      <div class="form-group mn-b-medium">
        <label for="title" class="t-white t-medium mn-b-thin d-block">Playlist Name</label>
        <Field 
          v-model:field="form.title"
          id="title"
          type="text"
          placeholder="New Playlist"
          :validation="validationErrors.title"
          class="w-100 pd-small bg-dark-transp-25 radius-small t-white"
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="description" class="t-white t-medium mn-b-thin d-block">Description</label>
        <Field 
          v-model:field="form.description"
          id="description"
          type="textarea"
          placeholder="Add an optional description"
          :validation="validationErrors.description"
          class="w-100 pd-small bg-dark-transp-25 radius-small t-white"
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label class="t-white t-medium mn-b-thin d-block">Privacy</label>
        <div class="flex gap-small">
          <Radio 
            v-model:radio="form.isPublic"
            :value="true"
            name="privacy"
            label="Public"
            class="t-white"
          />
          <Radio 
            v-model:radio="form.isPublic"
            :value="false"
            name="privacy"
            label="Private"
            class="t-white"
          />
        </div>
      </div>
      
      <div class="form-group mn-b-medium">
        <label class="t-white t-medium mn-b-thin d-block">Cover Image</label>
        <div class="playlist-cover-upload flex gap-medium">
          <div class="playlist-cover-preview bg-dark-transp-25 radius-small o-hidden">
            <Media 
              v-if="form.coverUrl"
              :url="form.coverUrl"
              class="w-10r h-10r object-fit-cover"
            />
            <div v-else class="w-10r h-10r flex-center flex">
              <IconMusic class="i-big" fill="rgb(var(--grey))"/>
            </div>
          </div>
          
          <UploadImage
            v-model:photo="form.coverUrl"
            uploadPath="playlists"
            class="flex-1 h-10r bg-dark-transp-25 radius-small"
          />
        </div>
      </div>
      
      <div class="form-actions t-right">
        <Button 
          @click="$emit('cancel')"
          type="button"
          class="bg-dark-transp-25 t-white pd-small radius-small mn-r-small hover-bg-dark"
          :showLoader="false" 
          :showSucces="false"
        >
          Cancel
        </Button>
        
        <Button 
          type="submit"
          class="bg-main t-white pd-small radius-small hover-scale-1"
          :submit="submitForm"
          :showLoader="true" 
          :showSucces="true"
          :validation="!!Object.keys(validationErrors).length"
        >
          Create Playlist
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Radio from '@martyrs/src/components/Radio/Radio.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import IconMusic from '@martyrs/src/modules/icons/entities/IconMusic.vue';

// Import auth store and playlists store
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { actions as playlistsActions } from '../../store/playlists.js';

const emit = defineEmits(['created', 'cancel']);

// Form data
const form = reactive({
  title: '',
  description: '',
  isPublic: true,
  coverUrl: '',
  isCollaborative: false,
  tracks: []
});

// Validation
const validationErrors = reactive({});

// Form submission
const submitForm = async () => {
  // Validate form
  validationErrors.title = !form.title ? { message: 'Playlist name is required' } : null;
  
  // If there are validation errors, don't submit
  if (Object.values(validationErrors).some(error => error !== null)) {
    return;
  }
  
  // Prepare playlist data
  const playlistData = {
    ...form,
    creator: {
      type: 'User',
      target: authState.user._id
    },
    owner: {
      type: 'User',
      target: authState.user._id
    }
  };
  
  try {
    const playlist = await playlistsActions.createPlaylist(playlistData);
    emit('created', playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    // Handle error (could add form-level error message)
  }
};
</script>