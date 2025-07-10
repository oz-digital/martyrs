<template>
  <div class="w-100" :style="{ '--cell-width': cellWidth + 'px' }">
    <GanttToolbar
      :view="view"
      :views="views"
      :date="date"
      @update:view="$emit('update:view', $event)"
      @update:date="$emit('update:date', $event)"
      @today="$emit('today')"
      @load-more="$emit('load-more', $event)"
    />
    
    <div 
      class="gantt-container scroller o-scroll bg-white radius-small br-solid br-1px br-black-transp-10"
      ref="container"
      @scroll="handleScroll"
    >
      <div class="gantt-content">
        <!-- Header -->
        <div class="gantt-header pos-sticky top-0 z-index-2 bg-white br-b br-solid br-black-transp-10">
          <div class="flex">
            <div class="gantt-product-col pos-sticky left-0 z-index-3 bg-light pd-small br-r br-solid br-black-transp-10">
              Product
            </div>
            
            <div class="gantt-timeline flex">
              <div
                v-for="(cell, i) in visibleCells"
                :key="cell.key"
                class="gantt-cell br-r br-solid br-black-transp-10 t-center pd-small"
                :class="getCellClass(cell)"
                :style="{ width: cellWidth + 'px' }"
              >
                <GanttHeaderCell :cell="cell" :view="view" :index="i" />
              </div>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="gantt-body">
          <div 
            v-for="(group, i) in groups" 
            :key="group.key" 
            class="gantt-row flex br-b br-solid br-black-transp-10"
            :class="i % 2 === 0 ? 'bg-light-transp' : ''"
            :style="{ height: rowHeight + 'px' }"
          >
            <div class="gantt-product-col pos-sticky left-0 z-index-1 bg-white pd-small br-r br-solid br-black-transp-10">
              <div class="t-medium mn-b-micro">{{ group.title }}</div>
              <div class="t-micro" :class="statusClass(group)">{{ group.status }}</div>
            </div>
            
            <div class="gantt-timeline pos-relative">
              <!-- Background cells -->
              <div class="gantt-cells flex pos-absolute h-100">
                <div
                  v-for="cell in visibleCells"
                  :key="cell.key + '-bg'"
                  class="gantt-cell h-100 br-r br-solid br-black-transp-10"
                  :class="getCellClass(cell)"
                  :style="{ width: cellWidth + 'px' }"
                />
              </div>
              
              <!-- Bars -->
              <div class="gantt-bars pos-absolute h-100">
                <GanttBar
                  v-for="bar in getBars(group)"
                  :key="bar.key"
                  :bar="bar"
                  :view="view"
                  @click="$emit('item-click', bar.item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch, nextTick, shallowRef, onMounted } from 'vue'
import dayjs from 'dayjs'
// import utc from 'dayjs/plugin/utc'
// import timezone from 'dayjs/plugin/timezone'

// dayjs.extend(utc)
// dayjs.extend(timezone)

import GanttToolbar from './GanttToolbar.vue'
import GanttHeaderCell from './GanttHeaderCell.vue'
import GanttBar from './GanttBar.vue'

const props = defineProps({
  items: { type: Array, required: true },
  view: { type: String, default: 'days' },
  date: { type: Date, required: true },
  dateRange: { type: Object, required: true },
  views: {
    type: Array,
    default: () => [
      { name: 'Hours', value: 'hours', width: 60 },
      { name: 'Days', value: 'days', width: 60 },
      { name: 'Weeks', value: 'weeks', width: 120 }
    ]
  },
  titleKey: { type: String, default: 'title' },
  startKey: { type: String, default: 'startDate' },
  endKey: { type: String, default: 'endDate' },
  statusKey: { type: String, default: 'status' },
  idKey: { type: String, default: 'id' },
  groupBy: { type: String, default: 'title' },
  loading: { type: Boolean, default: false },
  rowHeight: { type: Number, default: 60 }
})

const emit = defineEmits([
  'update:view',
  'update:date', 
  'update:dateRange',
  'load-more',
  'item-click',
  'today'
])

// State
const container = ref(null)
const scrollLeft = ref(0)

// Cell width
const cellWidth = computed(() => {
  const view = props.views.find(v => v.value === props.view)
  return view?.width || 60
})

// Visible cells
const visibleCells = computed(() => {
  if (!props.dateRange) return []
  
  const { start, end } = props.dateRange
  const cells = []
  
  switch (props.view) {
    case 'hours':
      // Start from beginning of the day (use only first day)
      const startDay = new Date(start)
      startDay.setHours(0, 0, 0, 0)
      
      // Generate hour cells for 24 hours (one day)
      for (let h = 0; h < 24; h++) {
        const cellDate = new Date(startDay)
        cellDate.setHours(h, 0, 0, 0)
        cells.push({
          type: 'hour',
          date: cellDate,
          hour: h,
          key: `${startDay.getTime()}-${h}`
        })
      }
      
      break
      
    case 'days':
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        cells.push({
          type: 'day',
          date: new Date(d),
          key: d.getTime()
        })
      }
      break
      
    case 'weeks':
      const weekStart = new Date(start)
      weekStart.setDate(start.getDate() - start.getDay())
      
      const currentWeek = new Date(weekStart)
      while (currentWeek <= end) {
        const weekEnd = new Date(currentWeek)
        weekEnd.setDate(currentWeek.getDate() + 6)
        
        cells.push({
          type: 'week',
          start: new Date(currentWeek),
          end: new Date(weekEnd),
          key: currentWeek.getTime()
        })
        
        currentWeek.setDate(currentWeek.getDate() + 7)
      }
      break
  }
  
  return cells
})

// Cache for bars calculation
const barsCache = new WeakMap()

// Helper function to get nested property value
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Groups
const groups = computed(() => {
  const map = new Map()
  
  props.items.forEach(item => {
    const key = getNestedValue(item, props.groupBy) || 'Ungrouped'
    
    if (!map.has(key)) {
      map.set(key, {
        key,
        title: key,
        items: [],
        status: getNestedValue(item, props.statusKey)
      })
    }
    
    map.get(key).items.push(item)
  })
  
  return Array.from(map.values())
})

// Cell class
const getCellClass = (cell) => {
  const classes = []
  const now = dayjs()
  
  switch (cell.type) {
    case 'hour':
      if (dayjs(cell.date).isSame(now, 'day') && cell.hour === now.hour()) {
        classes.push('bg-blue-transp')
      } else if (dayjs(cell.date).isSame(now, 'day')) {
        classes.push('bg-light')
      }
      break
      
    case 'day':
      const day = dayjs(cell.date).day()
      if (day === 0 || day === 6) classes.push('bg-light')
      if (dayjs(cell.date).isSame(now, 'day')) classes.push('bg-blue-transp')
      break
      
    case 'week':
      if (now.isAfter(cell.start) && now.isBefore(cell.end)) {
        classes.push('bg-blue-transp')
      }
      break
  }
  
  return classes.join(' ')
}

// Status class
const statusClass = (group) => {
  const s = group.status || 'default'
  const map = {
    active: 't-green',
    completed: 't-blue',
    canceled: 't-red',
    default: 't-transp'
  }
  return map[s] || map.default
}

// Get bars
const getBars = (group) => {
  const result = []
  const rows = []
  
  group.items.forEach(item => {
    try {
      const start = getNestedValue(item, props.startKey)
      const end = getNestedValue(item, props.endKey)
      
      if (!start || !end) return
      
      const s = start instanceof Date ? new Date(start) : dayjs(start).toDate()
      const e = end instanceof Date ? new Date(end) : dayjs(end).toDate()
      
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        console.warn(`Invalid dates for item ${getNestedValue(item, props.idKey)}:`, { start, end })
        return
      }
    
    console.log('Processing item:', {
      id: getNestedValue(item, props.idKey),
      start: s,
      end: e,
      dateRange: props.dateRange
    })
    
    // Skip if completely outside visible range
    if (e < props.dateRange.start || s > props.dateRange.end) {
      console.log('Item skipped - outside visible range')
      return
    }
    
    // Calculate position
    let left = 0
    let width = 0
    
    // Minimum width for very short intervals
    const minWidth = cellWidth.value * 0.1
    
    switch (props.view) {
      case 'hours':
        if (!visibleCells.value.length) return
        
        // Get the first cell's time as base reference
        const firstCell = visibleCells.value[0]
        const baseTime = new Date(firstCell.date)
        baseTime.setHours(0, 0, 0, 0)
        
        // Calculate exact minute positions from base time
        const minuteMs = 60 * 1000
        const hourMs = 60 * 60 * 1000
        
        // For long bars (>1 day), limit to visible day range
        const dayStart = new Date(baseTime)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(baseTime)
        dayEnd.setHours(23, 59, 59, 999)
        
        const visibleStart = s < dayStart ? dayStart : s
        const visibleEnd = e > dayEnd ? dayEnd : e
        
        // Calculate hour positions with minute precision
        const startHours = (visibleStart - baseTime) / hourMs
        const endHours = (visibleEnd - baseTime) / hourMs
        
        // Clip to visible range (0-24 hours)
        const clippedStart = Math.max(0, startHours)
        const clippedEnd = Math.min(24, endHours)
        
        // Skip if completely outside visible range
        if (clippedEnd <= clippedStart) {
          return
        }
        
        // Calculate pixel position
        left = clippedStart * cellWidth.value
        width = (clippedEnd - clippedStart) * cellWidth.value
        
        // Apply minimum width for very short intervals (3-7 minutes should be visible)
        width = Math.max(width, minWidth)
        
        break
        
      case 'days':
        const firstDay = visibleCells.value[0]?.date
        if (!firstDay) return
        
        const firstDayStart = new Date(firstDay)
        firstDayStart.setHours(0, 0, 0, 0)
        
        // Calculate exact positions with minute precision
        const dayMs = 24 * 60 * 60 * 1000
        const startDayFloat = (s - firstDayStart) / dayMs
        const endDayFloat = (e - firstDayStart) / dayMs
        
        // Clip to visible range
        const visibleDays = visibleCells.value.length
        const clippedStartDay = Math.max(0, startDayFloat)
        const clippedEndDay = Math.min(visibleDays, endDayFloat)
        
        // Skip if completely outside visible range
        if (clippedEndDay <= clippedStartDay) return
        
        left = clippedStartDay * cellWidth.value
        width = (clippedEndDay - clippedStartDay) * cellWidth.value
        
        // Apply minimum width for very short intervals
        width = Math.max(width, minWidth)
        break
        
      case 'weeks':
        const firstWeek = visibleCells.value[0]?.start
        if (!firstWeek) return
        
        // Calculate exact positions with minute precision
        const weekMs = 7 * 24 * 60 * 60 * 1000
        const startWeekFloat = (s - firstWeek) / weekMs
        const endWeekFloat = (e - firstWeek) / weekMs
        
        // Clip to visible range
        const visibleWeeks = visibleCells.value.length
        const clippedStartWeek = Math.max(0, startWeekFloat)
        const clippedEndWeek = Math.min(visibleWeeks, endWeekFloat)
        
        // Skip if completely outside visible range
        if (clippedEndWeek <= clippedStartWeek) return
        
        left = clippedStartWeek * cellWidth.value
        width = (clippedEndWeek - clippedStartWeek) * cellWidth.value
        
        // Apply minimum width for very short intervals
        width = Math.max(width, minWidth)
        break
    }
    
    // Find row
    let row = 0
    let placed = false
    
    while (!placed) {
      if (!rows[row]) rows[row] = []
      
      const overlap = rows[row].some(b => 
        (s <= b.end && e >= b.start)
      )
      
      if (!overlap) {
        rows[row].push({ start: s, end: e })
        placed = true
      } else {
        row++
      }
    }
    
      result.push({
        key: `${getNestedValue(item, props.idKey)}-${s.getTime()}`,
        item,
        left,
        width,
        row,
        status: getNestedValue(item, props.statusKey) || 'default'
      })
    } catch (error) {
      console.error(`Error processing item ${getNestedValue(item, props.idKey)}:`, error)
    }
  })
  
  console.log('Final bars result:', result)
  return result
}

// Throttle
const throttle = (fn, delay) => {
  let lastCall = 0
  let timeout = null
  
  const throttled = (...args) => {
    const now = Date.now()
    const remaining = delay - (now - lastCall)
    
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      lastCall = now
      return fn(...args)
    }
    
    if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now()
        timeout = null
        fn(...args)
      }, remaining)
    }
  }
  
  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return throttled
}

// Scroll handling
const handleScroll = (event) => {
  if (!container.value) return
  
  const el = event.target
  scrollLeft.value = el.scrollLeft
}

// Cleanup
onUnmounted(() => {
  // No cleanup needed
})

// Center view on specific date
const centerOnDate = (targetDate) => {
  if (!container.value) return
  
  nextTick(() => {
    const cells = visibleCells.value
    if (!cells.length) return
    
    let cellIndex = -1
    
    switch (props.view) {
      case 'hours':
        cellIndex = cells.findIndex(c => 
          c.type === 'hour' &&
          dayjs(c.date).isSame(targetDate, 'day') &&
          c.hour === targetDate.getHours()
        )
        break
        
      case 'days':
        cellIndex = cells.findIndex(c =>
          c.type === 'day' &&
          dayjs(c.date).isSame(targetDate, 'day')
        )
        break
        
      case 'weeks':
        cellIndex = cells.findIndex(c =>
          c.type === 'week' &&
          targetDate >= c.start &&
          targetDate <= c.end
        )
        break
    }
    
    if (cellIndex >= 0) {
      const scrollPos = cellIndex * cellWidth.value - container.value.clientWidth / 2
      container.value.scrollLeft = Math.max(0, scrollPos)
    }
  })
}

// Watch for view or date range changes
watch(() => props.view, () => {
  // Center on current date when view changes
  centerOnDate(props.date)
})

// Watch for date changes (e.g., when Today button is clicked)
watch(() => props.date, (newDate) => {
  // Center on the new date, especially important for hours view
  centerOnDate(newDate)
})

watch(() => props.dateRange, () => {
  // Reset scroll position when date range changes significantly
  if (container.value) {
    container.value.scrollLeft = 0
  }
}, { deep: true })
</script>

<style>
.gantt-container {
  --cell-width: 60px;
  height: 500px;
  position: relative;
}

.gantt-content {
  width: fit-content;
  min-width: 100%;
}

.gantt-header {
  height: 60px;
}

.gantt-product-col {
  width: 200px;
  min-width: 200px;
  flex-shrink: 0;
}

.gantt-timeline {
  position: relative;
  min-width: fit-content;
}

.gantt-cell {
  min-width: var(--cell-width);
  flex-shrink: 0;
}

.gantt-row {
  position: relative;
}

.gantt-cells,
.gantt-bars {
  width: fit-content;
  left: 0;
}
</style>