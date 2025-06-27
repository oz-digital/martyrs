<!-- filters/FilterRange.vue -->
<template>
  <div class="filter-range">
    <div class="range-slider">
      <input
        type="range"
        v-model.number="localValue"
        :min="config?.min || 0"
        :max="config?.max || 100"
        :step="config?.step || 1"
        @input="updateValue"
        class="w-100"
      />
      <div class="flex justify-between mt-thin">
        <span class="t-small">{{ config?.min || 0 }}{{ config?.unit || '' }}</span>
        <span class="t-bold">{{ localValue }}{{ config?.unit || '' }}</span>
        <span class="t-small">{{ config?.max || 100 }}{{ config?.unit || '' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  config: Object
})

const model = defineModel({
  type: Number,
  default: 0
})

const localValue = ref(model.value)

watch(model, (val) => {
  localValue.value = val
})

const updateValue = () => {
  model.value = localValue.value
}
</script>

<style>
.range-slider input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: var(--color-light);
  border-radius: 3px;
  outline: none;
}

.range-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.range-slider input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>