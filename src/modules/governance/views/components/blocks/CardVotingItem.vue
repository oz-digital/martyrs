<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  vote: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="vote-display">
    <h3>Your Vote</h3>
    <p>Choice: {{ vote.choice }}</p>
    <p>Cast on: {{ new Date(vote.createdAt).toLocaleString() }}</p>
  </div>
</template>
