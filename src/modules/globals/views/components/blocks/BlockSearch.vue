<script setup>
import { ref, watch } from 'vue';

import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';
import Field from '@martyrs/src/components/Field/Field.vue';

const emits = defineEmits(['search', 'update:modelValue']);
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter shop or product name'
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  button: {
    type: String,
    default: 'Search'
  },
});

const stateSearch = ref(props.modelValue);

// Обновлять поле при изменении modelValue извне
watch(() => props.modelValue, (newVal) => {
  stateSearch.value = newVal;
});

// Когда пользователь вводит новое значение
const updateSearch = (search) => {
  stateSearch.value = search;
  emits('update:modelValue', search); // уведомим родителя
  emits('search', search);            // при необходимости
};
</script>


<template>
  <div class="flex-v-center flex-nowrap flex pd-small bg-light w-100 radius-medium">
    <IconSearch class="i-medium t-transp mn-r-thin" />

    <Field
      v-model:field="stateSearch"
      :placeholder="placeholder"
      :autofocus="autofocus"
      class="w-100"
      @update:field="updateSearch"
    />
  </div>
</template>
