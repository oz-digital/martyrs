<template>
  <div>
    <div v-if="showHeader" class="flex-v-center flex-nowrap flex mn-b-medium">
      <h3 class="flex-child-full">Filters</h3>
    </div>

    <div class="filters-content">
      <div
        v-for="filter in filters"
        :key="filter.value"
        class="mn-b-medium"
      >
        <h4 class="mn-b-small">{{ filter.title }}</h4>

        <!-- Checkbox Filter -->
        <FilterCheckbox
          v-if="filter.type === 'checkbox'"
          v-model="workingValues[filter.value]"
          :options="filter.options"
          @apply="handleApply(filter.value)"
        />

        <!-- Range Filter -->
        <FilterRange
          v-else-if="filter.type === 'range'"
          v-model="workingValues[filter.value]"
          :minPlaceholder="filter.minPlaceholder || 'Min'"
          :maxPlaceholder="filter.maxPlaceholder || 'Max'"
          :label="filter.label"
          @apply="handleApply(filter.value)"
        />

        <!-- Date Filter -->
        <FilterDateRange
          v-else-if="filter.type === 'date'"
          v-model="workingValues[filter.value]"
          @apply="handleApply(filter.value)"
        />

        <!-- Radio/Options Filter -->
        <FilterOptions
          v-else-if="filter.type === 'radio'"
          v-model="workingValues[filter.value]"
          :options="filter.options"
        />
      </div>
    </div>

    <div class="flex gap-thin mn-t-medium">
      <button
        v-if="showApplyButton"
        @click="applyFilters"
        class="button bg-main flex-child-full"
      >
        Apply
      </button>
      <button
        v-if="showResetButton"
        @click="resetFilters"
        class="button bg-light"
        :class="{ 'flex-child-full': !showApplyButton }"
      >
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js'
import FilterCheckbox from './FilterCheckbox.vue'
import FilterRange from './FilterRange.vue'
import FilterDateRange from './FilterDateRange.vue'
import FilterOptions from './FilterOptions.vue'

const props = defineProps({
  filters: {
    type: Array,
    required: true
  },
  immediate: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showApplyButton: {
    type: Boolean,
    default: false
  },
  showResetButton: {
    type: Boolean,
    default: true
  }
})

const selected = defineModel('selected', {
  type: Object,
  default: () => ({})
})

const { returnCurrency } = useGlobalMixins()

const workingValues = reactive({})

// Initialize working values
watch(() => props.filters, (newFilters) => {
  newFilters.forEach(filter => {
    if (!workingValues[filter.value]) {
      if (filter.type === 'checkbox') {
        workingValues[filter.value] = [...(selected.value[filter.value] || [])]
      } else if (filter.type === 'range') {
        workingValues[filter.value] = { ...(selected.value[filter.value] || { min: '', max: '' }) }
      } else if (filter.type === 'date') {
        workingValues[filter.value] = selected.value[filter.value] || null
      } else {
        workingValues[filter.value] = selected.value[filter.value] || null
      }
    }
  })
}, { immediate: true, deep: true })

// Sync selected to workingValues
watch(selected, (newValue) => {
  Object.keys(newValue).forEach(key => {
    const filter = props.filters.find(f => f.value === key)
    if (filter) {
      if (filter.type === 'checkbox') {
        workingValues[key] = [...(newValue[key] || [])]
      } else if (filter.type === 'range') {
        workingValues[key] = { ...(newValue[key] || { min: '', max: '' }) }
      } else {
        workingValues[key] = newValue[key]
      }
    }
  })
}, { deep: true })

const handleApply = (filterValue) => {
  if (props.immediate) {
    const updated = { ...selected.value }
    updated[filterValue] = workingValues[filterValue]
    selected.value = updated
  }
}

const applyFilters = () => {
  const updated = {}
  Object.keys(workingValues).forEach(key => {
    updated[key] = workingValues[key]
  })
  selected.value = updated
}

const resetFilters = () => {
  props.filters.forEach(filter => {
    if (filter.type === 'checkbox') {
      workingValues[filter.value] = []
    } else if (filter.type === 'range') {
      workingValues[filter.value] = { min: '', max: '' }
    } else if (filter.type === 'date') {
      workingValues[filter.value] = null
    } else {
      workingValues[filter.value] = null
    }
  })

  if (props.immediate) {
    applyFilters()
  }
}
</script>

<style scoped>
</style>
