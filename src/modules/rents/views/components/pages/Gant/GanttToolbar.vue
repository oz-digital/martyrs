<template>
  <div class="flex-nowrap w-100 flex bg-light pd-small radius-medium mn-b-small">
    <div class="flex w-100 gap-micro flex-v-center flex-nowrap">
      <Tab
        :selected="view"
        :tabs="tabs"
        @tab-click="$emit('update:view', $event.tab.value)"
        class="mn-r-auto h-100 flex-child-default o-hidden pd-nano radius-small bg-white"
        classTab="pd-thin radius-thin"
      />

      <Button 
        @click="navPrev" 
        class="bg-white aspect-1x1 pd-small radius-small"
        aria-label="Previous period"
      >
        <IconChevronLeft class="i-small"/>
      </Button>
      
      <div class="flex h-100 flex-v-center">
        <Dropdown 
          :label="dateLabel"
          align="left"
          class="pos-relative z-index-3 h-100 bg-white radius-small pd-thin"
        >
          <Calendar 
            v-model:date="selectedDate"
            @update:date="updateDate"
            class="bg-white radius-small pd-small"
          />
        </Dropdown>
      </div>
      
      <Button 
        @click="navNext" 
        class="bg-white aspect-1x1 pd-small radius-small"
        aria-label="Next period"
      >
        <IconChevronRight class="i-small"/>
      </Button>
      
      <Button 
        @click="$emit('today')" 
        class="pd-r-small pd-l-small radius-small bg-second t-white mn-l-thin"
      >
        Today
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'

import Tab from '@martyrs/src/components/Tab/Tab.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue'
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'
import DateLabel from './DateLabel.vue'

import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue'
import IconChevronLeft from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue'

const props = defineProps({
  view: { type: String, required: true },
  views: { type: Array, required: true },
  date: { type: Date, required: true }
})

const emit = defineEmits(['update:view', 'update:date', 'today'])

// View tabs
const tabs = computed(() => 
  props.views.map(v => ({
    name: v.name,
    label: v.name,
    value: v.value
  }))
)

// Date label based on view
const dateLabel = computed(() => {
  const d = dayjs(props.date)
  
  let dateText
  switch (props.view) {
    case 'hours':
      dateText = d.format('DD/MM/YYYY')
      break
    case 'days':
      dateText = d.format('MMMM YYYY')
      break
    case 'weeks':
      dateText = d.format('MMMM YYYY')
      break
    default:
      dateText = d.format('MMMM YYYY')
  }
  
  return {
    component: DateLabel,
    props: {
      dateText
    },
    class: 'cursor-pointer'
  }
})

// Selected date for calendar
const selectedDate = ref(props.date)

// Navigation
const navPrev = () => {
  const d = dayjs(props.date)
  let newDate
  
  switch (props.view) {
    case 'hours':
      newDate = d.subtract(1, 'day').toDate()
      break
    case 'days':
      newDate = d.subtract(1, 'month').toDate()
      break
    case 'weeks':
      newDate = d.subtract(1, 'month').toDate()
      break
  }
  
  emit('update:date', newDate)
}

const navNext = () => {
  const d = dayjs(props.date)
  let newDate
  
  switch (props.view) {
    case 'hours':
      newDate = d.add(1, 'day').toDate()
      break
    case 'days':
      newDate = d.add(1, 'month').toDate()
      break
    case 'weeks':
      newDate = d.add(1, 'month').toDate()
      break
  }
  
  emit('update:date', newDate)
}

const updateDate = (newSelectedDate) => {
  if (newSelectedDate) {
    const newDate = new Date(newSelectedDate)
    emit('update:date', newDate)
    // Emit load-more event to trigger data loading for new date
    emit('load-more', 'refresh')
  }
}

// Watch for props.date changes to update selectedDate
watch(() => props.date, (newDate) => {
  selectedDate.value = newDate
})
</script>