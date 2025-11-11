<!-- FilterCheckbox.vue -->
<template>
  <div class="filter-checkbox">
    <Checkbox
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      v-model:radio="model"
      :label="option.label"
      :value="option.value"
      mode="checkbox"
      class="br-solid br-1px br-light pd-small radius-small mn-b-micro"
      @update:radio="emit('apply')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'

const props = defineProps({
  options: {
    type: Array,
    required: true
  }
})

const model = defineModel({
  type: Array,
  default: () => []
})

const emit = defineEmits(['apply'])

// Normalize options to always have label and value
const normalizedOptions = computed(() => {
  if (!props.options || !Array.isArray(props.options)) return []

  return props.options.map((option, index) => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }
    if (typeof option === 'object' && option !== null) {
      return {
        label: option.label || option.text || option.name || String(option.value || option),
        value: option.value || option.text || option.label || option._id || option.id || `option-${index}`
      }
    }
    return { label: String(option), value: `option-${index}` }
  })
})
</script>

<style scoped>
.filter-checkbox {
  max-height: 300px;
  overflow-y: auto;
}
</style>