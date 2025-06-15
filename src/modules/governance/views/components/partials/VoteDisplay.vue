<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="voting-result">
    <h3>Voting Results</h3>
    <ul>
      <li v-for="(count, option) in results" :key="option">
        {{ option }}: {{ count }} votes
      </li>
    </ul>
  </div>
</template>