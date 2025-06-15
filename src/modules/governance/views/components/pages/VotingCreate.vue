<script setup>
import { ref } from 'vue';
import { votingsActions } from '../../store/votings';
import FormVotingDetails from '../sections/FormVotingDetails.vue';

const newVoting = ref({
  title: '',
  description: '',
  startDate: null,
  endDate: null
});

const createVoting = async () => {
  await votingsActions.createVoting(newVoting.value);
  // Redirect or show success message
};
</script>

<template>
  <div>
    <h1>Create New Voting</h1>
    <FormVotingDetails v-model="newVoting" />
    <button @click="createVoting">Create Voting</button>
  </div>
</template>