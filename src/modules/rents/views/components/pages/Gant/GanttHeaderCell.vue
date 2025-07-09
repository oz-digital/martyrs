<template>
  <div class="gantt-header-content">
    <!-- Hour view -->
    <template v-if="cell.type === 'hour'">
      <div v-if="isFirst || cell.hour === 0" class="t-micro">
        {{ dayjs(cell.date).format('DD/MM') }}
      </div>
      <div class="t-small">{{ cell.hour }}:00</div>
    </template>
    
    <!-- Day view -->
    <template v-else-if="cell.type === 'day'">
      <!-- <div v-if="isFirst || cell.date.getDate() === 1" class="t-micro">
        {{ dayjs(cell.date).format('MMM YYYY') }}
      </div> -->
      <div class="t-medium">{{ cell.date.getDate() }}</div>
      <div class="t-micro t-transp">{{ dayjs(cell.date).format('ddd') }}</div>
    </template>
    
    <!-- Week view -->
    <template v-else-if="cell.type === 'week'">
      <!-- <div v-if="isFirst || isMonthStart" class="t-micro">
        {{ dayjs(cell.start).format('MMM YYYY') }}
      </div> -->
      <div class="t-small">{{ dayjs(cell.start).format('D') }}-{{ dayjs(cell.end).format('D') }}</div>
      <div class="t-micro t-transp">W{{ weekNumber }}</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'

dayjs.extend(weekOfYear)

const props = defineProps({
  cell: { type: Object, required: true },
  view: { type: String, required: true },
  index: { type: Number, default: 0 }
})

const isFirst = computed(() => props.index === 0)

const isMonthStart = computed(() => {
  if (props.cell.type !== 'week') return false
  return props.cell.start.getDate() <= 7 && props.cell.start.getDay() === 0
})

const weekNumber = computed(() => {
  if (props.cell.type !== 'week') return null
  return dayjs(props.cell.start).week()
})
</script>