<!-- filters/FilterPrice.vue -->
<template>
  <div class="filter-price">
    <div class="flex flex-v-center gap-thin">
      <Field
        type="number"
        v-model:field="localValue.min"
        :placeholder="minPlaceholder"
        :label="label"
        class="flex-1 bg-light pd-regular radius-small"
        @blur="updateValue"
      />
      <span class="t-small">—</span>
      <Field
        type="number"
        v-model:field="localValue.max"
        :placeholder="maxPlaceholder"
        :label="label"
        class="flex-1 bg-light pd-regular radius-small"
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
  },
  minPlaceholder: {
    type: String,
    default: 'Min'
  },
  maxPlaceholder: {
    type: String,
    default: 'Max'
  },
  label: {
    type: String,
    default: undefined
  }
})

const model = defineModel({
  type: Object,
  default: () => ({ min: null, max: null })
})

const emit = defineEmits(['update:modelValue', 'apply'])

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
  emit('apply')
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