<!-- filters/FilterOptions.vue -->
<template>
  <div class="filter-options">
    <div
      v-for="option in options"
      :key="option.value"
      class="flex align-center gap-thin pd-thin cursor-pointer hover-bg-light radius-small"
      @click="toggleOption(option.value)"
    >
      <Field
        type="checkbox"
        v-model:field="checkboxStates[option.value]"
        class="mr-thin"
      />
      <span>{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue';


const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  }
})

const model = defineModel({
  type: Array,
  default: () => []
})

// Создаем объект для хранения состояний чекбоксов
const checkboxStates = ref({})

// Инициализация состояний
props.options.forEach(option => {
  checkboxStates.value[option.value] = model.value.includes(option.value)
})

// Следим за изменениями модели
watch(model, (newVal) => {
  props.options.forEach(option => {
    checkboxStates.value[option.value] = newVal.includes(option.value)
  })
}, { deep: true })

// Обновляем модель при изменении чекбоксов
watch(checkboxStates, (states) => {
  const selected = []
  Object.entries(states).forEach(([value, checked]) => {
    if (checked) selected.push(value)
  })
  model.value = selected
}, { deep: true })

const toggleOption = (value) => {
  checkboxStates.value[value] = !checkboxStates.value[value]
}
</script>