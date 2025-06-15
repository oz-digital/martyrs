<script setup>
import { ref } from 'vue';
import { tasksActions } from '../../store/tasks';
import FormTaskDetails from '../sections/FormTaskDetails.vue';

const newTask = ref({
  name: '',
  description: '',
  status: 'todo',
  assignedTo: ''
});

const createTask = async () => {
  await tasksActions.createTask(newTask.value);
  // Redirect or show success message
};
</script>

<template>
  <div>
    <h1>Create New Task</h1>
    <FormTaskDetails v-model="newTask" />
    <button @click="createTask">Create Task</button>
  </div>
</template>