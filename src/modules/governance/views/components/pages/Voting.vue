<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { votingsActions, votingsState } from '../../store/votings';
import VoteForm from '../sections/VoteForm.vue';
import VotingResult from '../partials/VotingResult.vue';

const route = useRoute();
const voting = ref(null);
const results = ref(null);

onMounted(async () => {
  const id = route.params.id;
  await votingsActions.getVotingById(id);
  voting.value = votingsState.current;
  if (voting.value.status === 'ended') {
    results.value = await votingsActions.getVotingResults(id);
  }
});
</script>

<template>
  <div v-if="voting">
    <h1>{{ voting.title }}</h1>
    <p>{{ voting.description }}</p>
    <p>Status: {{ voting.status }}</p>
    <VoteForm v-if="voting.status === 'active'" :votingId="voting.id" />
    <VotingResult v-if="results" :results="results" />
  </div>
</template>