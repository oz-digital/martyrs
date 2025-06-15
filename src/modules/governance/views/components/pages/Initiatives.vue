<script setup>
import { onMounted, ref } from 'vue';
import { initiativesActions, initiativesState } from '../../store/initiatives';
import CardInitiativeItem from '../blocks/CardInitiativeItem.vue';

const initiatives = ref([]);

onMounted(async () => {
  await initiativesActions.getAllInitiatives();
  initiatives.value = initiativesState.all;
});
</script>

<template>
  <div>
    <h1>Initiatives</h1>
    <router-link :to="{name:'Create Initiative' }">Create Initiative</router-link>
    <CardInitiativeItem v-for="initiative in initiatives" :key="initiative.id" :initiative="initiative" />
  </div>
</template>