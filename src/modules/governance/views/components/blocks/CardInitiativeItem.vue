<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  initiative: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="card">
    <h2>{{ initiative.name }}</h2>
    <p>{{ initiative.description }}</p>
    <p>Status: {{ initiative.status }}</p>
  </div>
</template>