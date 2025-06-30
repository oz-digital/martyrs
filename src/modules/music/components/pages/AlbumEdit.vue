<template>
  <AlbumForm :editMode="true" :url="url" />
</template>

<script setup>
import AlbumForm from '../forms/AlbumForm.vue';

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
</script>