<!-- components/forms/UploadForm.vue -->
<template>
  <div class="upload-form">
    <!-- <form @submit.prevent="submitForm"> -->
      <div class="form-group mn-b-medium">
        <label for="title" class=" t-medium mn-b-thin d-block">Track Title</label>
        <Field 
          v-model:field="form.title"
          id="title"
          type="text"
          placeholder="Track Title"
          :validation="validationErrors.title"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>

      <div class="form-group mn-b-medium">
        <label for="artist" class=" t-medium mn-b-thin d-block">Artist</label>
        <Select 
          v-model:select="form.artist"
          id="artist"
          :options="artistOptions"
          placeholder="Select an artist"
          :validation="validationErrors.artist"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>

      <div class="form-group mn-b-medium">
        <label for="album" class=" t-medium mn-b-thin d-block">Album (Optional)</label>
        <Select 
          v-model:select="form.album"
          id="album"
          :options="albumOptions"
          placeholder="Select an album"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="genre" class=" t-medium mn-b-thin d-block">Genre</label>
        <Select 
          v-model:select="form.genre"
          id="genre"
          :options="genreOptions"
          placeholder="Select a genre"
          :validation="validationErrors.genre"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="releaseDate" class=" t-medium mn-b-thin d-block">Release Date</label>
        <Field 
          v-model:field="form.releaseDate"
          id="releaseDate"
          type="date"
          :validation="validationErrors.releaseDate"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="isExplicit" class=" t-medium mn-b-thin d-block">Explicit Content</label>
        <Checkbox 
          v-model:checkbox="form.isExplicit"
          id="isExplicit"
          label="This track contains explicit content"
          class=""
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="isPublic" class=" t-medium mn-b-thin d-block">Privacy</label>
        <div class="flex gap-small">
          <Radio 
            v-model:radio="form.isPublic"
            :value="true"
            name="privacy"
            label="Public"
            class=""
          />
          <Radio 
            v-model:radio="form.isPublic"
            :value="false"
            name="privacy"
            label="Private"
            class=""
          />
        </div>
      </div>
      
      <div class="form-group mn-b-medium">
        <label class=" t-medium mn-b-thin d-block">Cover Image</label>
        <div class="track-cover-upload flex gap-medium">
          <div class="track-cover-preview bg-dark-transp-25 radius-small o-hidden">
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
            uploadPath="tracks"
            class="flex-1 h-10r bg-dark-transp-25 radius-small"
          />
        </div>
      </div>
      
      <div class="form-group mn-b-medium">
        <label class=" t-medium mn-b-thin d-block">Track Audio File</label>
        <Upload
          v-model:field="form.fileUrl"
          @file-change="(url) => form.fileUrl = url"
          type="file"
          uploadPath="tracks"
          class="bg-dark-transp-25 radius-small pd-small "
        />
      </div>
      
      <div class="form-group mn-b-medium">
        <label for="lyrics" class=" t-medium mn-b-thin d-block">Lyrics (Optional)</label>
        <Field 
          v-model:field="form.lyrics"
          id="lyrics"
          type="textarea"
          placeholder="Add lyrics"
          class="w-100 pd-small bg-dark-transp-25 radius-small "
        />
      </div>
      
      <div class="form-actions t-right">
        <Button 
          @click="resetForm"
          type="button"
          class="bg-dark-transp-25  pd-small radius-small mn-r-small hover-bg-dark"
          :showLoader="false" 
          :showSucces="false"
        >
          Reset
        </Button>
        
        <Button 
          type="submit"
          class="bg-main  pd-small radius-small hover-scale-1"
          :submit="() => submitForm()"
          :showLoader="true" 
          :showSucces="true"
        >
          Upload Track
        </Button>
      </div>
    <!-- </form> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import Radio from '@martyrs/src/components/Radio/Radio.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Upload from '@martyrs/src/components/Upload/Upload.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import IconMusic from '@martyrs/src/modules/icons/entities/IconMusic.vue';

// Import stores
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { actions as tracksActions } from '../../store/tracks.js';
import { state as artistsState, actions as artistsActions } from '../../store/artists.js';
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';

const emit = defineEmits(['uploaded']);

// Form data
const form = reactive({
  title: '',
  artist: null,
  album: null,
  genre: [],
  releaseDate: new Date().toISOString().split('T')[0],
  isExplicit: false,
  isPublic: true,
  coverUrl: '',
  fileUrl: '',
  lyrics: ''
});

// Options for dropdowns
const artistOptions = ref([]);
const albumOptions = ref([]);
const genreOptions = ref([
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Electronic', 'Classical', 'Country', 'Folk', 'Blues'
]);

// Validation
const validationErrors = reactive({});

/// Form submission with improved error handling
const submitForm = async () => {
  // Validate form (I'm keeping this commented out as in your original code)
  // validationErrors.title = !form.title ? { message: 'Track title is required' } : null;
  // validationErrors.artist = !form.artist ? { message: 'Artist is required' } : null;
  // validationErrors.genre = !form.genre || form.genre.length === 0 ? { message: 'Genre is required' } : null;
  // validationErrors.fileUrl = !form.fileUrl ? { message: 'Audio file is required' } : null;
  
  // // If there are validation errors, don't submit
  // if (Object.values(validationErrors).some(error => error !== null)) {
  //   console.log(error)
  //   return;
  // }
  
  console.log('Submitting form data:', form);
  
  // Check if the API URL is correct
  console.log('API URL:', process.env.API_URL);
  
  // Prepare track data
  const trackData = {
    ...form,
    creator: {
      type: 'user', // Make sure type matches what's expected on the server (lowercase)
      target: authState.user._id
    },
    owner: {
      type: 'user', // Make sure type matches what's expected on the server (lowercase)
      target: authState.user._id
    },
    status: 'draft' // Add a default status if needed
  };
  
  try {
    console.log('Sending track data to API:', trackData);
    
    // Directly use the Store instance to debug the issue
    // This bypasses the action layer to see if the issue is there
    // const directApiResult = await trackStore.create(trackData);
    // console.log('Direct API result:', directApiResult);
    
    // If the direct approach works, try the normal action
    const track = await tracksActions.createTrack(trackData);
    console.log('Track created successfully:', track);
    
    emit('uploaded', track);
    resetForm();
  } catch (error) {
    console.error('Error uploading track:', error);
    
    // Add more detailed error logging
    if (error.status) {
      console.error(`HTTP Status: ${error.status}`);
    }
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    
    // Show error to user
    // setError({
    //   message: 'Failed to upload track: ' + (error.message || 'Unknown error'),
    //   errorCode: error.errorCode || 'TRACK_UPLOAD_FAILED'
    // });
  }
};
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'releaseDate') {
      form[key] = new Date().toISOString().split('T')[0];
    } else if (key === 'isPublic') {
      form[key] = true;
    } else if (key === 'isExplicit') {
      form[key] = false;
    } else {
      form[key] = '';
    }
  });
  
  // Clear validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = null;
  });
};

// Fetch artists and albums for dropdowns
onMounted(async () => {
  try {
    // Fetch user's artists
    const userArtists = await artistsActions.fetchUserArtists(authState.user._id);
    artistOptions.value = userArtists.map(artist => ({
      name: artist.name,
      value: artist._id
    }));
    
    // Fetch user's albums
    const userAlbums = await albumsActions.fetchUserAlbums(authState.user._id);
    albumOptions.value = userAlbums.map(album => ({
      name: album.title,
      value: album._id
    }));
  } catch (error) {
    console.error('Error fetching artists and albums:', error);
  }
});
</script>