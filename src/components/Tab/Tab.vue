<template>
  <div class="flex-nowrap flex-v-center flex pos-relative">
    <button  
      v-for="(tab, index) in tabs" 
      :key="index" 
      @click="handleTabClick(index, tab)" 
      class="z-index-1 t-center cursor-pointer"
      :style="isSelected(index, tab) ? 'background: rgb(var(--main)) !important' : ''"
      :class="[
        isSelected(index, tab) ? 'bg-main' : '',
        replaceClasses('pd-small pd-r-medium pd-l-medium w-max pd-small radius-small', classTab)
      ]"
    >
      {{tab.name || tab.label}}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { replaceClasses } = useGlobalMixins();
const emit = defineEmits(['update:selected', 'tab-click']);

const props = defineProps({
  tabs: Array,
  classTab: String,
  selected: [String, Number],
  modelValue: [String, Number],
  callback: Function
})

const selectedTab = ref(0)

// Handle both v-model and selected prop for backward compatibility
const updateSelectedIndex = () => {
  if (props.modelValue !== undefined) {
    const selectedIndex = props.tabs.findIndex(tab => tab.value === props.modelValue)
    if (selectedIndex !== -1) {
      selectedTab.value = selectedIndex
    }
  } else if (props.selected !== undefined) {
    const selectedIndex = props.tabs.findIndex(tab => tab.value === props.selected)
    if (selectedIndex !== -1) {
      selectedTab.value = selectedIndex
    }
  }
}

// Initial setup
updateSelectedIndex()

// Watch for changes in selected or modelValue props
watch(() => props.selected, updateSelectedIndex)
watch(() => props.modelValue, updateSelectedIndex)

// Check if tab is selected
const isSelected = (index, tab) => {
  if (props.modelValue !== undefined) {
    return tab.value === props.modelValue
  } else if (props.selected !== undefined) {
    return tab.value === props.selected
  }
  return index === selectedTab.value
}

// Handle tab click
function handleTabClick(index, tab) {
  selectedTab.value = index
  
  // Emit both events for flexibility
  emit('update:selected', tab.value)
  emit('tab-click', { index, tab })
  
  // For v-model support
  if (props.modelValue !== undefined) {
    emit('update:modelValue', tab.value)
  }
  
  // Call callback if provided
  if (props.callback) props.callback(tab)
}
</script>

<style lang="scss">
.tab-selector {
  position: absolute;
  width: 50%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 0;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>