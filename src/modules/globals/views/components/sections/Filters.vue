<template>
  <div class="flex t-nowrap  gap-thin">
    <!-- All Filters Button -->
    <button
      @click="showAllFilters = true"
      class="pd-small radius-medium bg-light flex-v-center flex gap-micro cursor-pointer"
      :class="{ 'bg-main': activeFiltersCount > 0 }"
    >
      <IconFilter class="i-medium" />
      <span class="h-1r"></span>
      <span v-if="activeFiltersCount">{{ activeFiltersCount }}</span>
    </button>

    <!-- Individual Filter Buttons -->
    <button
      v-for="filter in filters"
      :key="filter.value"
      @click="openFilter(filter.value)"
      class="pd-small radius-medium bg-light cursor-pointer flex-v-center flex gap-micro"
      :class="{ 'selected bg-main': isFilterActive(filter) }"
    >
      <IconCalendar v-if="filter.type === 'date'" class="i-medium" />
      <span class="t-nowrap h-1r">{{ filter.title }}</span>
      <span v-if="getFilterValue(filter)" class="mn-l-micro">
        {{ formatFilterValue(filter) }}
      </span>
    </button>

    <!-- All Filters Popup -->
    <Popup
      :isPopupOpen="showAllFilters"
      @close-popup="showAllFilters = false"
      :align="isPhone() ? 'bottom center' : 'center center'"
      class="w-min-20r bg-white radius-medium mobile:radius-zero mobile:radius-tr-medium mobile:radius-tl-medium mobile:w-100 pd-medium"
    >
      <div class="flex-v-center flex-nowrap flex mn-b-medium">
        <h3 class="flex-child-full">Filters</h3>
        <IconCross 
          @click="showAllFilters = false" 
          class="i-regular cursor-pointer"
        />
      </div>

      <div class="filters-content">
        <div 
          v-for="filter in filters" 
          :key="filter.value"
          class="mn-b-medium"
        >
          <h4 class="mn-b-small">{{ filter.title }}</h4>
          
          <!-- Checkbox Filter -->
          <div v-if="filter.type === 'checkbox'">
            <Checkbox
              v-for="option in filter.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              v-model:radio="tempSelected[filter.value]"
              mode="checkbox"
              class="mn-b-micro"
            />
          </div>

          <!-- Radio Filter -->
          <div v-else-if="filter.type === 'radio'">
            <div
              v-for="option in filter.options"
              :key="option.value"
              @click="tempSelected[filter.value] = option.value"
              class="pd-small radius-small cursor-pointer mn-b-micro"
              :class="{ 
                'bg-main': tempSelected[filter.value] === option.value,
                'bg-light': tempSelected[filter.value] !== option.value
              }"
            >
              {{ option.label }}
            </div>
          </div>

          <!-- Range Filter -->
          <div v-else-if="filter.type === 'range'" class="flex gap-thin">
            <Field
              v-model:field="tempSelected[filter.value].min"
              :placeholder="filter.minPlaceholder || 'Min'"
              type="number"
              class="w-50 bg-light pd-small radius-small"
            />
            <Field
              v-model:field="tempSelected[filter.value].max"
              :placeholder="filter.maxPlaceholder || 'Max'"
              type="number"
              class="w-50 bg-light pd-small  radius-small"
            />
          </div>

          <!-- Date Filter -->
          <div v-else-if="filter.type === 'date'">
            <Calendar
              v-model:date="tempSelected[filter.value]"
              :allowRange="true"
              :disablePastDates="true"
              class="bg-light  radius-small"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-thin mn-t-medium">
        <button 
          @click="applyAllFilters" 
          class="button bg-main flex-child-full"
        >
          Apply
        </button>
        <button 
          @click="resetFilters" 
          class="button bg-light"
        >
          Reset Filters
        </button>
      </div>
    </Popup>

    <!-- Individual Filter Popups -->
    <Popup
      v-for="filter in filters"
      :key="`popup-${filter.value}`"
      :isPopupOpen="individualPopups[filter.value]"
      @close-popup="individualPopups[filter.value] = false"
      :align="isPhone() ? 'bottom center' : 'center center'"
      class="bg-white radius-medium mobile:radius-zero mobile:radius-tr-medium mobile:radius-tl-medium mobile:w-100 pd-medium"
    >
      <h4 class="mn-b-medium">{{ filter.title }}</h4>
      
      <!-- Checkbox Filter -->
      <div v-if="filter.type === 'checkbox'">
        <Checkbox
          v-for="option in filter.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
          v-model:radio="tempSelected[filter.value]"
          mode="checkbox"
          class="mn-b-micro"
        />
      </div>

      <!-- Radio Filter -->
      <div v-else-if="filter.type === 'radio'">
        <div
          v-for="option in filter.options"
          :key="option.value"
          @click="tempSelected[filter.value] = option.value"
          class="pd-small radius-small cursor-pointer mn-b-micro"
          :class="{ 
            'bg-main': tempSelected[filter.value] === option.value,
            'bg-light': tempSelected[filter.value] !== option.value
          }"
        >
          {{ option.label }}
        </div>
      </div>

      <!-- Range Filter -->
      <div v-else-if="filter.type === 'range'" class="flex gap-thin">
        <Field
          v-model:field="tempSelected[filter.value].min"
          :placeholder="filter.minPlaceholder || 'Min'"
          type="number"
          class="w-50 bg-light pd-small radius-small"
        />
        <Field
          v-model:field="tempSelected[filter.value].max"
          :placeholder="filter.maxPlaceholder || 'Max'"
          type="number"
          class="w-50 bg-light pd-small radius-small"
        />
      </div>

      <!-- Date Filter -->
      <div v-else-if="filter.type === 'date'">
        <div 
          @click="() => { tempDateRange = tempSelected[filter.value]; tempSelected[filter.value] = tempSelected[filter.value] || null; }"
          class="pd-small radius-small bg-light cursor-pointer flex-v-center flex gap-micro"
        >
          <IconCalendar class="i-small" />
          <span>{{ tempSelected[filter.value] ? `${formatDate(tempSelected[filter.value].start, { dayMonth: true, language: 'en' })} - ${formatDate(tempSelected[filter.value].end, { dayMonth: true, language: 'en' })}` : 'Select dates'}}</span>
        </div>
        <div class="mn-t-small">
          <Calendar
            v-model:date="tempSelected[filter.value]"
            :allowRange="true"
            :disablePastDates="true"
            class="bg-light radius-small"
          />
        </div>
      </div>

      <div class="flex gap-thin mn-t-medium">
        <button 
          @click="cancelFilter(filter.value)" 
          class="w-100 button bg-light"
        >
          Cancel
        </button>
        <button 
          @click="applyFilter(filter.value)" 
          class="w-100 button bg-main"
        >
          Apply
        </button>
        
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'
import IconFilter from '@martyrs/src/modules/icons/navigation/IconFilter.vue'
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue'
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue'

const filters = defineModel('filters', {
  type: Array,
  required: true
})

const selected = defineModel('selected', {
  type: Object,
  default: () => ({})
})

const emit = defineEmits(['select'])

const { formatDate } = useGlobalMixins()

// State
const showAllFilters = ref(false)
const individualPopups = reactive({})
const tempSelected = reactive({})
const tempDateRange = ref(null)

// Initialize popups and temp values
watch(filters, (newFilters) => {
  newFilters.forEach(filter => {
    individualPopups[filter.value] = false
    
    if (!tempSelected[filter.value]) {
      if (filter.type === 'checkbox') {
        tempSelected[filter.value] = [...(selected.value[filter.value] || [])]
      } else if (filter.type === 'range') {
        tempSelected[filter.value] = { ...(selected.value[filter.value] || { min: '', max: '' }) }
      } else if (filter.type === 'date') {
        tempSelected[filter.value] = selected.value[filter.value] || null
      } else {
        tempSelected[filter.value] = selected.value[filter.value] || null
      }
    }
  })
}, { immediate: true, deep: true })

// Sync selected to tempSelected
watch(selected, (newSelected) => {
  Object.keys(newSelected).forEach(key => {
    const filter = filters.value.find(f => f.value === key)
    if (filter) {
      if (filter.type === 'checkbox') {
        tempSelected[key] = [...(newSelected[key] || [])]
      } else if (filter.type === 'range') {
        tempSelected[key] = { ...(newSelected[key] || { min: '', max: '' }) }
      } else {
        tempSelected[key] = newSelected[key]
      }
    }
  })
}, { deep: true })

// Computed
const activeFiltersCount = computed(() => {
  return Object.entries(selected.value).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) {
      return value.min || value.max
    }
    return value !== null && value !== undefined
  }).length
})

// Methods
const openFilter = (filterValue) => {
  individualPopups[filterValue] = true
}

const isFilterActive = (filter) => {
  const value = selected.value[filter.value]
  if (!value) return false
  if (Array.isArray(value)) return value.length > 0
  if (filter.type === 'range') return value.min || value.max
  return true
}

const getFilterValue = (filter) => {
  return selected.value[filter.value]
}

const formatFilterValue = (filter) => {
  const value = selected.value[filter.value]
  if (!value) return ''
  
  if (Array.isArray(value)) {
    return `(${value.length})`
  }
  
  if (filter.type === 'range') {
    if (!value.min && !value.max) return ''
    return `${value.min || '0'}-${value.max || '∞'}`
  }
  
  if (filter.type === 'date') {
    if (!value || !value.start || !value.end) return ''
    return `${formatDate(value.start, { dayMonth: true, language: 'en' })} - ${formatDate(value.end, { dayMonth: true, language: 'en' })}`
  }
  
  if (filter.type === 'radio') {
    const option = filter.options.find(o => o.value === value)
    return option ? `(${option.label})` : ''
  }
  
  return ''
}

const applyFilter = (filterValue) => {
  selected.value[filterValue] = tempSelected[filterValue]
  individualPopups[filterValue] = false
  emit('select', { filter: filterValue, value: tempSelected[filterValue] })
}

const cancelFilter = (filterValue) => {
  const filter = filters.value.find(f => f.value === filterValue)
  if (filter) {
    if (filter.type === 'checkbox') {
      tempSelected[filterValue] = [...(selected.value[filterValue] || [])]
    } else if (filter.type === 'range') {
      tempSelected[filterValue] = { ...(selected.value[filterValue] || { min: '', max: '' }) }
    } else if (filter.type === 'date') {
      tempSelected[filterValue] = selected.value[filterValue] || null
    } else {
      tempSelected[filterValue] = selected.value[filterValue] || null
    }
  }
  individualPopups[filterValue] = false
}

const applyAllFilters = () => {
  Object.entries(tempSelected).forEach(([key, value]) => {
    if (selected.value[key] !== value) {
      selected.value[key] = value
      emit('select', { filter: key, value })
    }
  })
  showAllFilters.value = false
}

const resetFilters = () => {
  filters.value.forEach(filter => {
    if (filter.type === 'checkbox') {
      tempSelected[filter.value] = []
      selected.value[filter.value] = []
    } else if (filter.type === 'range') {
      tempSelected[filter.value] = { min: '', max: '' }
      selected.value[filter.value] = { min: '', max: '' }
    } else if (filter.type === 'date') {
      tempSelected[filter.value] = null
      selected.value[filter.value] = null
    } else {
      tempSelected[filter.value] = null
      selected.value[filter.value] = null
    }
    emit('select', { filter: filter.value, value: null })
  })
}
</script>

<style scoped>
.filters-content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>