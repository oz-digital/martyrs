<!-- FilterRange.vue -->
<template>
  <div class="filter-range">
    <div class="flex gap-thin mn-b-small">
      <Field
        v-model="localValue.min"
        :placeholder="minPlaceholder"
        type="number"
        class="w-50 bg-light pd-small radius-small"
        @keypress.enter="applyRange"
      />
      <Field
        v-model="localValue.max"
        :placeholder="maxPlaceholder"
        type="number"
        class="w-50 bg-light pd-small radius-small"
        @keypress.enter="applyRange"
      />
    </div>
    <button 
      @click="applyRange"
      class="button bg-main t-white w-100 pd-small radius-small"
    >
      Apply
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue'

const props = defineProps({
  minPlaceholder: {
    type: String,
    default: 'From'
  },
  maxPlaceholder: {
    type: String,
    default: 'To'
  }
})

const model = defineModel({
  type: Object,
  default: () => ({ min: '', max: '' })
})

const emit = defineEmits(['update:modelValue', 'apply'])

const localValue = ref({ 
  min: model.value?.min || '', 
  max: model.value?.max || '' 
})

const applyRange = () => {
  model.value = { ...localValue.value }
  emit('apply')
}

watch(() => model.value, (newVal) => {
  if (newVal) {
    localValue.value = { 
      min: newVal.min || '', 
      max: newVal.max || '' 
    }
  }
}, { deep: true })
</script>

<style scoped>
.filter-range {
  width: 100%;
}
</style>