<!-- FiltersBar.vue -->
<template>
  <div class="flex gap-thin">
    <!-- All Filters Button -->
    <button
      @click="showAllFilters = true"
      class="btn-filter radius-medium pd-thin bg-light"
      :class="{ 'bg-primary t-white': hasActiveFilters }"
    >
      <IconFilter class="w-1r h-auto" />
      <span v-if="activeFiltersCount" class="ml-thin">{{ activeFiltersCount }}</span>
    </button>

    <!-- Individual Filter Buttons -->
    <button
      v-for="(filter, idx) in filters"
      :key="idx"
      @click="() => openFilter(idx)"
      class="btn-filter radius-medium pd-thin bg-light"
      :class="{ 'bg-primary t-white': getFilterActiveState(filter) }"
    >
      {{ getFilterLabel(filter) }}
    </button>

    <!-- All Filters Popup -->
    <Popup
      v-model:show="showAllFilters"
      align="bottom center"
      class="w-100 max-h-80vh"
    >
      <div class="pd-medium bg-white radius-top-medium">
        <div class="flex justify-between align-center mb-medium">
          <h3 class="t-h3">Filters</h3>
          <IconCross @click="showAllFilters = false" class="w-1r h-auto cursor-pointer" />
        </div>
        
        <div class="filters-container">
          <div v-for="(filter, idx) in filters" :key="idx" class="mb-medium">
            <h4 class="t-h4 mb-thin">{{ filter.title }}</h4>
            <component
              :is="getFilterComponent(filter.type)"
              v-model="appliedFilters[filter.key]"
              :options="filter.options"
              :config="filter.config"
            />
          </div>
        </div>

        <div class="flex gap-thin mt-medium">
          <button @click="applyFilters" class="btn btn-primary flex-1">Apply</button>
          <button @click="resetFilters" class="btn btn-secondary">Reset</button>
        </div>
      </div>
    </Popup>

    <!-- Individual Filter Popups -->
    <Popup
      :isPopupOpen="individualPopups[idx]" 
      v-for="(filter, idx) in filters"
      :key="`popup-${idx}`"
      align="bottom center"
      class="min-w-200"
    >
      <div class="pd-medium bg-white radius-medium">
        <h4 class="t-h4 mb-thin">{{ filter.title }}</h4>
        <component
          :is="getFilterComponent(filter.type)"
          v-model="appliedFilters[filter.key]"
          :options="filter.options"
          :config="filter.config"
          @update:modelValue="() => updateFilter(filter.key)"
        />
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import IconFilter from '@martyrs/src/modules/icons/navigation/IconFilter.vue'
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue'

// Import filter components
import FilterOptions from './filters/FilterOptions.vue'
import FilterRange from './filters/FilterRange.vue'
import FilterPrice from './filters/FilterPrice.vue'

const props = defineProps({
  filters: {
    type: Array,
    required: true
  }
})

const model = defineModel({
  type: Object,
  default: () => ({})
})

// State
const showAllFilters = ref(false)
const individualPopups = reactive({})
const appliedFilters = reactive({})

// Initialize filters
props.filters.forEach(filter => {
  individualPopups[props.filters.indexOf(filter)] = false
  if (!appliedFilters[filter.key]) {
    appliedFilters[filter.key] = filter.defaultValue || null
  }
})

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(appliedFilters).some(v => v !== null && v !== undefined)
})

const activeFiltersCount = computed(() => {
  return Object.values(appliedFilters).filter(v => v !== null && v !== undefined).length
})

// Methods
const getFilterComponent = (type) => {
  if (typeof type === 'object') return type
  
  const components = {
    options: FilterOptions,
    range: FilterRange,
    price: FilterPrice
  }
  
  return components[type] || FilterOptions
}

const getFilterLabel = (filter) => {
  const value = appliedFilters[filter.key]
  if (!value) return filter.title
  
  if (Array.isArray(value) && value.length) {
    return `${filter.title} (${value.length})`
  }
  
  if (typeof value === 'object' && (value.min || value.max)) {
    return `${filter.title}: ${value.min || 0}-${value.max || '∞'}`
  }
  
  return `${filter.title}: ${value}`
}

const getFilterActiveState = (filter) => {
  const value = appliedFilters[filter.key]
  return value !== null && value !== undefined
}

const openFilter = (idx) => {
  individualPopups[idx] = true
}

const updateFilter = (key) => {
  model.value = { ...appliedFilters }
}

const applyFilters = () => {
  model.value = { ...appliedFilters }
  showAllFilters.value = false
}

const resetFilters = () => {
  Object.keys(appliedFilters).forEach(key => {
    appliedFilters[key] = null
  })
  model.value = {}
}
</script>

<style>
.btn-filter {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-filter:hover {
  opacity: 0.8;
}

.filters-container {
  max-height: 60vh;
  overflow-y: auto;
}
</style>