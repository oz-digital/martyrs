<script setup>
import { ref } from 'vue';
import { initiativesActions } from '../../store/initiatives';
import FormInitiativeDetails from '../sections/FormInitiativeDetails.vue';

const newInitiative = ref({
  name: '',
  description: '',
  status: 'draft'
});

const createInitiative = async () => {
  await initiativesActions.createInitiative(newInitiative.value);
  // Redirect or show success message
};
</script>

<template>
  <div>
    <h1>Create New Initiative</h1>
    <FormInitiativeDetails v-model="newInitiative" />
    <button @click="createInitiative">Create Initiative</button>
  </div>
</template>