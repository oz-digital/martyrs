<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const updateField = (field, value) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};
</script>

<template>
  <form>
    <div>
      <label for="name">Name:</label>
      <input id="name" v-model="modelValue.name" @input="updateField('name', $event.target.value)" />
    </div>
    <div>
      <label for="description">Description:</label>
      <textarea id="description" v-model="modelValue.description" @input="updateField('description', $event.target.value)"></textarea>
    </div>
    <div>
      <label for="status">Status:</label>
      <select id="status" v-model="modelValue.status" @change="updateField('status', $event.target.value)">
        <option value="todo">To Do</option>
        <option value="inProgress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
    <div>
      <label for="assignedTo">Assigned To:</label>
      <input id="assignedTo" v-model="modelValue.assignedTo" @input="updateField('assignedTo', $event.target.value)" />
    </div>
  </form>
</template>