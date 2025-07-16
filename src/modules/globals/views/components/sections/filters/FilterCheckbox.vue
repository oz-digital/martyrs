<!-- FilterCheckbox.vue -->
<template>
  <div class="filter-checkbox">
    <div
      v-for="(option, index) in normalizedOptions"
      :key="option.value"
      @click="toggleOption(option.value)"
      :class="{ 'bg-light': isSelected(option.value) }"
      class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'apply'])

const localValue = ref([...(model.value || [])])

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

const isSelected = (value) => {
  return localValue.value.includes(value)
}

const toggleOption = (value) => {
  const idx = localValue.value.indexOf(value)
  if (idx > -1) {
    localValue.value.splice(idx, 1)
  } else {
    localValue.value.push(value)
  }
  model.value = [...localValue.value]
  emit('apply')
}

watch(() => model.value, (newVal) => {
  localValue.value = [...(newVal || [])]
}, { deep: true })
</script>

<style scoped>
.filter-checkbox {
  max-height: 300px;
  overflow-y: auto;
}
</style>