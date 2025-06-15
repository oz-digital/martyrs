<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="card">
    <h2>{{ task.name }}</h2>
    <p>{{ task.description }}</p>
    <p>Status: {{ task.status }}</p>
    <p>Assigned to: {{ task.assignedTo }}</p>
  </div>
</template>
