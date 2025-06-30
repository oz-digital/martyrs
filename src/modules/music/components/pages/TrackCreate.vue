<!-- components/pages/TrackCreate.vue -->
<template>
  <div class="track-create-page">
    <TrackForm :editMode="false" @uploaded="onTrackUploaded" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@martyrs/src/components/Button/Button.vue';
import TrackForm from '../forms/TrackForm.vue';

// Import auth store
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

const router = useRouter();

const onTrackUploaded = (track) => {
  // Navigate to the uploaded track's detail page
  router.push({ name: 'track', params: { url: track.url } });
};
</script>