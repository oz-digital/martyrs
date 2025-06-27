<!-- filters/FilterPrice.vue -->
<template>
  <div class="filter-price">
    <div class="flex gap-thin align-center">
      <Field
        type="number"
        v-model:field="localValue.min"
        placeholder="Min"
        class="flex-1 bg-light pd-medium radius-small"
        @blur="updateValue"
      />
      <span class="t-small">—</span>
      <Field
        type="number"
        v-model:field="localValue.max"
        placeholder="Max"
        class="flex-1 bg-light pd-medium radius-small"
        @blur="updateValue"
      />
    </div>
    
    <div v-if="config?.presets" class="mt-thin">
      <button
        v-for="preset in config.presets"
        :key="preset.label"
        @click="applyPreset(preset)"
        class="btn btn-small mr-thin mb-thin"
        :class="isPresetActive(preset) ? 'btn-primary' : 'btn-secondary'"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue';

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  }
})

const model = defineModel({
  type: Object,
  default: () => ({ min: null, max: null })
})

const localValue = ref({ 
  min: model.value?.min || null, 
  max: model.value?.max || null 
})

watch(model, (val) => {
  if (val) {
    localValue.value = { 
      min: val.min || null, 
      max: val.max || null 
    }
  }
}, { deep: true })

const updateValue = () => {
  model.value = { ...localValue.value }
}

const applyPreset = (preset) => {
  localValue.value = { 
    min: preset.min || null, 
    max: preset.max || null 
  }
  updateValue()
}

const isPresetActive = (preset) => {
  return localValue.value.min === preset.min && localValue.value.max === preset.max
}
</script>