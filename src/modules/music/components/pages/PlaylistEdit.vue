<template>
  <PlaylistForm :editMode="true" :url="url" />
</template>

<script setup>
import PlaylistForm from '../forms/PlaylistForm.vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
</script>