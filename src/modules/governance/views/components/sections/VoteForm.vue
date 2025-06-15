<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';
import { votesActions } from '../../store/votes';

const props = defineProps({
  votingId: {
    type: String,
    required: true
  }
});

const choice = ref('');

const castVote = async () => {
  await votesActions.castVote(props.votingId, { choice: choice.value });
  // Show success message or update UI
};
</script>

<template>
  <form @submit.prevent="castVote">
    <div>
      <label for="choice">Your Choice:</label>
      <input id="choice" v-model="choice" required />
    </div>
    <button type="submit">Cast Vote</button>
  </form>
</template>