<!-- filters/FilterOptions.vue -->
<template>
  <div class="filter-options">
    <Checkbox
      v-for="option in options"
      :key="option.value"
      v-model:radio="model"
      :label="option.label"
      :value="option.value"
      mode="radio"
      class="mn-b-micro"
      @update:radio="emit('apply')"
    />
  </div>
</template>

<script setup>
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  }
})

const model = defineModel({
  type: String,
  default: null
})

const emit = defineEmits(['apply'])
</script>