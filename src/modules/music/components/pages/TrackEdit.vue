<template>
  <TrackForm :editMode="true" :url="url" />
</template>

<script setup>
import TrackForm from '../forms/TrackForm.vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
</script>