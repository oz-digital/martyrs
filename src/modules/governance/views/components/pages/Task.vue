<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { tasksActions, tasksState } from '../../store/tasks';

const route = useRoute();
const task = ref(null);

onMounted(async () => {
  const id = route.params.id;
  await tasksActions.getTaskById(id);
  task.value = tasksState.current;
});
</script>

<template>
  <div v-if="task">
    <h1>{{ task.name }}</h1>
    <p>{{ task.description }}</p>
    <p>Status: {{ task.status }}</p>
    <p>Assigned to: {{ task.assignedTo }}</p>
  </div>
</template>