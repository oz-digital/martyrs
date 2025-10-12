<!-- FilterDateRange.vue -->
<template>
  <div class="filter-date-range">
    <!-- Quick options -->
    <div 
      v-for="option in dateOptions"
      :key="option.value"
      @click="selectOption(option.value)"
      :class="{ 'bg-light': selectedOption === option.value }"
      class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
    >
      {{ option.label }}
    </div>
    
    <!-- Custom dates -->
    <div 
      @click="() => { tempDates = model.value ? {...model.value} : null; showCalendar = true }"
      :class="{ 'bg-light': selectedOption === 'custom' }"
      class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
    >
      {{ dateRangeLabel }}
    </div>

    <!-- Calendar Popup -->
    <Popup
      v-model:show="showCalendar"
      class="pd-medium bg-white radius-medium"
      style="min-width: 350px;"
    >
      <h3 class="mn-b-medium">Select Date Range</h3>
      
      <Calendar
        v-model:date="tempDates"
        :allowRange="true"
        :disablePastDates="true"
        class="mn-b-medium"
      />
      
      <div class="flex gap-small">
        <button 
          @click="applyDates"
          class="button bg-main t-white flex-child-full pd-small radius-small"
        >
          Apply
        </button>
        <button 
          @click="showCalendar = false"
          class="button bg-light flex-child-full pd-small radius-small"
        >
          Cancel
        </button>
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js'

const { formatDate } = useGlobalMixins()

const props = defineProps({
  dateOptions: {
    type: Array,
    default: () => [
      { label: 'Available today', value: 'today' },
      { label: 'This week', value: 'week' },
      { label: 'This month', value: 'month' }
    ]
  }
})

const model = defineModel({
  type: Object,
  default: () => null
})

const emit = defineEmits(['update:modelValue', 'apply'])

const showCalendar = ref(false)
const selectedOption = ref(null)
const tempDates = ref(null)

const dateRangeLabel = computed(() => {
  if (!model.value || !model.value.start || !model.value.end) {
    return 'Select dates'
  }
  const start = formatDate(model.value.start, { dayMonth: true, language: 'en' })
  const end = formatDate(model.value.end, { dayMonth: true, language: 'en' })
  return `${start} - ${end}`
})

const selectOption = (value) => {
  selectedOption.value = value
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let dateRange = null
  
  switch(value) {
    case 'today':
      dateRange = {
        start: today,
        end: today
      }
      break
    case 'week':
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() + 7)
      dateRange = {
        start: today,
        end: weekEnd
      }
      break
    case 'month':
      const monthEnd = new Date(today)
      monthEnd.setMonth(today.getMonth() + 1)
      dateRange = {
        start: today,
        end: monthEnd
      }
      break
  }
  
  if (dateRange) {
    model.value = dateRange
    emit('apply')
  }
}

const applyDates = () => {
  if (tempDates.value) {
    model.value = tempDates.value
    selectedOption.value = 'custom'
    emit('apply')
  }
  showCalendar.value = false
}

// Watch for model changes to update selected option
watch(() => model.value, (newVal) => {
  if (newVal && newVal.start && newVal.end) {
    tempDates.value = { ...newVal }
    
    // Determine which option is selected based on dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(newVal.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(newVal.end)
    end.setHours(0, 0, 0, 0)
    
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24))
    
    if (start.getTime() === today.getTime() && end.getTime() === today.getTime()) {
      selectedOption.value = 'today'
    } else if (start.getTime() === today.getTime() && diffDays === 7) {
      selectedOption.value = 'week'
    } else if (start.getTime() === today.getTime() && diffDays >= 28 && diffDays <= 31) {
      selectedOption.value = 'month'
    } else {
      selectedOption.value = 'custom'
    }
  } else {
    selectedOption.value = null
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.filter-date-range {
  width: 100%;
}
</style>