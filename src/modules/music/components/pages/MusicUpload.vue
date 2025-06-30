<!-- components/pages/MusicUpload.vue -->
<template>
  <div class="music-upload-page">
    <h1 class=" mn-b-medium">Upload Music</h1>
    
    <div class="upload-container bg-dark-transp-10 radius-medium pd-medium">
      <div v-if="!authState.access.status" class="t-center pd-big">
        <h2 class=" mn-b-small">Sign in to upload</h2>
        <p class="t-grey t-medium mn-b-medium">You need to be signed in to upload tracks</p>
        <Button 
          @click="$router.push({ name: 'Sign In', query: { redirect: $route.fullPath } })"
          class="bg-main  radius-small pd-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          Sign In
        </Button>
      </div>
      
      <div v-else>
        <h2 class=" mn-b-medium">Upload a Track</h2>
        
        <UploadForm @uploaded="onTrackUploaded" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@martyrs/src/components/Button/Button.vue';
import UploadForm from '../forms/UploadForm.vue';

// Import auth store
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

const router = useRouter();

const onTrackUploaded = (track) => {
  // Navigate to the uploaded track's detail page
  router.push({ name: 'track-detail', params: { url: track.url } });
};
</script>