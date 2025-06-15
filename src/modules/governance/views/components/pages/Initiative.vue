<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { initiativesActions, initiativesState } from '../../store/initiatives';

const route = useRoute();
const initiative = ref(null);

onMounted(async () => {
  const id = route.params.id;
  await initiativesActions.getInitiativeById(id);
  initiative.value = initiativesState.current;
});
</script>

<template>
  <div v-if="initiative">
    <h1>{{ initiative.name }}</h1>
    <p>{{ initiative.description }}</p>
    <p>Status: {{ initiative.status }}</p>
  </div>
</template>