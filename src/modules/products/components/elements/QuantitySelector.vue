<!-- QuantitySelector.vue -->
<template>
  <div class="flex flex-nowrap gap-thin">
    <button 
      @click="decrementQuantity" 
      class="radius-small pd-small bg-light flex-center flex aspect-1x1 cursor-pointer hover-scale-1"
      :disabled="modelValue <= 1"
    >
      <span class="i-medium">-</span>
    </button>
    <div class="radius-small br-solid br-1px br-light w-3r pd-small">
      <input
        type="number"
        v-model.number="modelValue"
        @input="validateInput"
        class="w-100 h-1r t-center"
        :min="1"
        :max="maxValue"
      />
    </div>
    <button 
      @click="incrementQuantity" 
      class="radius-small pd-small bg-light flex-center flex aspect-1x1 cursor-pointer hover-scale-1"
      :disabled="modelValue >= maxValue"
    >
      <span class="i-medium">+</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  maxValue: {
    type: Number,
    default: Infinity
  }
});

const modelValue = defineModel();

function validateInput() {
  if (modelValue.value < 1) {
    modelValue.value = 1;
  } else if (modelValue.value > props.maxValue) {
    modelValue.value = props.maxValue;
  }
}

function incrementQuantity() {
  if (modelValue.value < props.maxValue) {
    modelValue.value++;
  }
}

function decrementQuantity() {
  if (modelValue.value > 1) {
    modelValue.value--;
  }
}
</script>