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
      <label for="title">Title:</label>
      <input id="title" v-model="modelValue.title" @input="updateField('title', $event.target.value)" />
    </div>
    <div>
      <label for="description">Description:</label>
      <textarea id="description" v-model="modelValue.description" @input="updateField('description', $event.target.value)"></textarea>
    </div>
    <div>
      <label for="startDate">Start Date:</label>
      <input id="startDate" type="datetime-local" v-model="modelValue.startDate" @input="updateField('startDate', $event.target.value)" />
    </div>
    <div>
      <label for="endDate">End Date:</label>
      <input id="endDate" type="datetime-local" v-model="modelValue.endDate" @input="updateField('endDate', $event.target.value)" />
    </div>
  </form>
</template>