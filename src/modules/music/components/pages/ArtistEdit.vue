<template>
  <ArtistForm :editMode="true" :url="url" />
</template>

<script setup>
import ArtistForm from '../forms/ArtistForm.vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
</script>