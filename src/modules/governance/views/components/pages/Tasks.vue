<script setup>
import { onMounted, ref } from 'vue';
import { tasksActions, tasksState } from '../../store/tasks';
import CardTaskItem from '../blocks/CardTaskItem.vue';

const tasks = ref([]);

onMounted(async () => {
  await tasksActions.getAllTasks();
  tasks.value = tasksState.all;
});
</script>

<template>
  <div>
    <h1>Tasks</h1>
    <CardTaskItem v-for="task in tasks" :key="task.id" :task="task" />
  </div>
</template>