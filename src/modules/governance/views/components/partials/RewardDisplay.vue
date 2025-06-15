<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  reward: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="reward-display">
    <h3>Reward</h3>
    <p>Type: {{ reward.type }}</p>
    <p>Amount: {{ reward.amount }}</p>
    <p v-if="reward.description">Description: {{ reward.description }}</p>
  </div>
</template>