<script setup>
import { onMounted, ref } from 'vue';
import { votingsActions, votingsState } from '../../store/votings';
import CardVotingItem from '../blocks/CardVotingItem.vue';

const votings = ref([]);

onMounted(async () => {
  await votingsActions.getAllVotings();
  votings.value = votingsState.all;
});
</script>

<template>
  <div>
    <h1>Votings</h1>
    <CardVotingItem v-for="voting in votings" :key="voting.id" :voting="voting" />
  </div>
</template>