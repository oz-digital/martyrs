<template>
  <div class="gantt-chart-container">
     

    <div class="flex-nowrap  w-100 flex bg-light pd-small radius-small mn-b-small">
      <div class="flex w-100 gap-thin flex-v-center flex-nowrap">
        <Tab
          :tabs="viewOptions"
          @tab-click="switchView($event.tab.value)"
          class="mn-r-auto h-100 flex-child-default o-hidden p-small pd-nano radius-small bg-white"
          tabClass=" pd-thin radius-thin"
        />

        <button @click="navigatePrevious" class="h-100 bg-white aspect-1x1 pd-x-small radius-small bg-light mn-r-x-small">
          <IconChevronLeft class="i-small"/>
        </button>
        
        <div class="month-year-selector flex-v-center">

         <!--  <Select 
            v-model:select="currentMonth"
            :options="months"
            class="pos-relative w-100 bg-white radius-small pd-thin "
          /> -->
          <select v-model="currentMonth" style="border: 0" class="pd-thin h-100 t-black radius-small bg-white mn-r-micro">
            <option v-for="(month, index) in months" :key="index" :value="index">
              {{ month }}
            </option>
          </select>

           <Select 
            v-model:select="currentYear"
            :options="yearOptions"
            class="pos-relative w-100 bg-white radius-small pd-thin "
          />
        </div>
        
        <button @click="navigateNext" class="h-100 bg-white aspect-1x1 pd-x-small radius-small bg-light mn-r-x-small">
          <IconChevronRight class="i-small"/>
        </button>
        
        <button @click="goToToday" class="h-100 pd-r-small p-small pd-l-small radius-small bg-second t-white mn-l-small">
          Today
        </button>
      </div>
    </div>

    <!-- Gantt Chart View -->
    <div 
      class="gantt-chart scroller o-scroll
scroll-snap-type-x-mandatory  scroll-pd-regular  bg-white radius-small" 
      ref="ganttContainer"
      @scroll="handleScroll"
    >
      <!-- Header with dates -->
      <div class="gantt-header">
        <div class="gantt-header-row">
          <div class="gantt-header-item product-column z-index-2">Product</div>
          <div class="gantt-timeline-header bg-white br-b br-solid br-black-transp" ref="timelineHeader">
            <!-- Hours view -->
            <template v-if="currentView === 'hours'">
              <div 
                v-for="(hour, index) in visibleHours" 
                :key="`hour-${index}`"
                class="gantt-header-cell"
                :class="{ 
                  'is-current-hour': isCurrentHour(hour.date, hour.hour),
                  'is-today': isToday(hour.date)
                }"
              >
                <div class="date-label">
                  <div v-if="hour.hour === 0 || index === 0" class="day-month-label">
                    {{ formatShortDate(hour.date) }}
                  </div>
                  <div class="hour-number">{{ formatHour(hour.hour) }}</div>
                </div>
              </div>
            </template>
            
            <!-- Days view -->
            <template v-else-if="currentView === 'days'">
              <div 
                v-for="(date, index) in visibleDates" 
                :key="`day-${index}`"
                class="gantt-header-cell"
                :class="{ 
                  'is-weekend': isWeekend(date),
                  'is-today': isToday(date),
                  'is-month-start': date.getDate() === 1
                }"
              >
                <div class="date-label">
                  <div v-if="date.getDate() === 1 || index === 0" class="month-label">
                    {{ formatMonth(date) }}
                  </div>
                  <div class="day-number">{{ date.getDate() }}</div>
                  <div class="day-name">{{ formatDay(date) }}</div>
                </div>
              </div>
            </template>
            
            <!-- Weeks view -->
            <template v-else-if="currentView === 'weeks'">
              <div 
                v-for="(week, index) in visibleWeeks" 
                :key="`week-${index}`"
                class="gantt-header-cell gantt-week-cell"
                :class="{ 
                  'is-current-week': isCurrentWeek(week.start),
                  'is-month-start': week.start.getDate() <= 7 && week.start.getDay() === 0
                }"
              >
                <div class="date-label">
                  <div v-if="week.isMonthStart || index === 0" class="month-label">
                    {{ formatMonth(week.start) }}
                  </div>
                  <div class="week-range">
                    {{ formatDateRange(week.start, week.end) }}
                  </div>
                  <div class="week-number">W{{ getWeekNumber(week.start) }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Body with products and rentals -->
      <div class="gantt-body">
  <div 
    v-for="(group, index) in groupedItems" 
    :key="group.title" 
    class="gantt-row"
    :class="{ 'is-even': index % 2 === 0 }"
  >
    <div class="gantt-row-item product-column z-index-2">
      <div class="product-title">{{ group.title }}</div>
      <div class="product-status" :class="getStatusClass(group)">
        {{ group.status }}
      </div>
    </div>
    
    <div class="gantt-timeline-row">
      <!-- Hours cells -->
      <template v-if="currentView === 'hours'">
        <div 
          v-for="(hour, hourIndex) in visibleHours" 
          :key="`hour-cell-${hourIndex}`"
          class="gantt-cell"
          :class="{ 
            'is-current-hour': isCurrentHour(hour.date, hour.hour),
            'is-today': isToday(hour.date) 
          }"
        ></div>
      </template>
      
      <!-- Days cells -->
      <template v-else-if="currentView === 'days'">
        <div 
          v-for="(date, dateIndex) in visibleDates" 
          :key="`day-cell-${dateIndex}`"
          class="gantt-cell"
          :class="{ 
            'is-weekend': isWeekend(date),
            'is-today': isToday(date) 
          }"
        ></div>
      </template>
      
      <!-- Weeks cells -->
      <template v-else-if="currentView === 'weeks'">
        <div 
          v-for="(week, weekIndex) in visibleWeeks" 
          :key="`week-cell-${weekIndex}`"
          class="gantt-cell gantt-week-cell"
          :class="{ 
            'is-current-week': isCurrentWeek(week.start)
          }"
        ></div>
      </template>
      
      <div 
        v-for="bar in getItemBars(group)"
        :key="`${group.title}-${bar.start}-${bar.item[idKey]}`"
        class="gantt-bar"
        :class="getBarStatusClass(bar.item)"
        :style="{
          left: `${bar.left}px`,
          width: `${bar.width}px`,
          top: `${bar.rowIndex * rowHeight.value}px`,
          zIndex: 10 - bar.rowIndex // Ensure bars in front rows appear above those in back rows
        }"
        @click="$emit('item-click', bar.item)"
      >
        <div class="gantt-bar-label">{{ getItemTitle(bar.item) }}</div>
      </div>
    </div>
  </div>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

import Tab from '@martyrs/src/components/Tab/Tab.vue';
import Select from "@martyrs/src/components/Select/Select.vue";


import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';
import IconChevronLeft from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startDateKey: {
    type: String,
    default: 'startDate'
  },
  endDateKey: {
    type: String,
    default: 'endDate'
  },
  titleKey: {
    type: String,
    default: 'title'
  },
  statusKey: {
    type: String,
    default: 'status'
  },
  idKey: {
    type: String,
    default: 'id'
  }
});

const emit = defineEmits(['load-more', 'item-click']);

// References
const ganttContainer = ref(null);
const timelineHeader = ref(null);

// State
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const viewOptions = [
  { name: 'Hours',label: 'Hours', value: 'hours' },
  { name: 'Days',label: 'Days', value: 'days' },
  { name: 'Weeks',label: 'Weeks', value: 'weeks' }
];

const currentView = ref('days');
const displayStartDate = ref(new Date(props.startDate));
const displayEndDate = ref(new Date(props.endDate));
const currentMonth = ref(months[new Date().getMonth()]);
const currentYear = ref(new Date().getFullYear());
const cellWidth = ref(60); 

// Calculate years to display in the dropdown (current year ±5 years)
const currentYearValue = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [];
  for (let i = currentYearValue - 5; i <= currentYearValue + 5; i++) {
    years.push(i);
  }
  return years;
});

// Calculate visible dates based on current view (for days view)
const visibleDates = computed(() => {
  const dates = [];
  const start = new Date(displayStartDate.value);
  const end = new Date(displayEndDate.value);
  
  // For days view
  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    dates.push(new Date(current));
  }
  
  return dates;
});

// Calculate visible hours for hours view
const visibleHours = computed(() => {
  const hours = [];
  const start = new Date(displayStartDate.value);
  const end = new Date(displayEndDate.value);
  
  // Set hours to cover a full day (24 hours per day)
  for (let current = new Date(start); current <= end;) {
    for (let hour = 0; hour < 24; hour += 2) { // Show every 2 hours to fit more on screen
      hours.push({
        date: new Date(current),
        hour: hour
      });
    }
    current.setDate(current.getDate() + 1);
  }
  
  return hours;
});

// Calculate visible weeks for weeks view
const visibleWeeks = computed(() => {
  const weeks = [];
  const start = new Date(displayStartDate.value);
  const end = new Date(displayEndDate.value);
  
  // Start from the beginning of the week
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() - start.getDay()); // Move to Sunday
  
  for (let current = new Date(weekStart); current <= end;) {
    const weekEnd = new Date(current);
    weekEnd.setDate(current.getDate() + 6); // Saturday
    
    weeks.push({
      start: new Date(current),
      end: new Date(weekEnd),
      isMonthStart: current.getDate() <= 7 && current.getDay() === 0
    });
    
    current.setDate(current.getDate() + 7); // Move to next week
  }
  
  return weeks;
});

// Function to switch between views
const switchView = (viewType) => {
  currentView.value = viewType;
  
  // Adjust date range based on the view
  updateDateRangeForView();
  
  // Reset scrolling
  nextTick(() => {
    if (ganttContainer.value) {
      ganttContainer.value.scrollLeft = 0;
    }
  });
};

// Update date range based on selected view
const isInitialLoad = ref(true);
const updateDateRangeForView = () => {
  // If it's the initial load and we have props, use those values instead
  if (isInitialLoad.value) {
    isInitialLoad.value = false;
    // Keep the props dates, don't modify them
    return;
  }

  const currentDate = new Date(currentYear.value, currentMonth.value, 1);
  
  switch (currentView.value) {
    case 'hours':
      // For hours, show 3 days centered on the selected date
      displayStartDate.value = new Date(currentDate);
      displayEndDate.value = new Date(currentDate);
      displayEndDate.value.setDate(displayStartDate.value.getDate() + 2);
      cellWidth.value = 30; // Narrower cells for hours
      break;
      
    case 'days':
      // For days, show the whole month plus some padding
      displayStartDate.value = new Date(currentDate);
      displayEndDate.value = new Date(currentDate);
      displayEndDate.value.setMonth(displayEndDate.value.getMonth() + 1);
      displayEndDate.value.setDate(0); // Last day of the month
      cellWidth.value = 60; // Default cell width for days
      break;
      
    case 'weeks':
      // For weeks, show around 8 weeks
      displayStartDate.value = new Date(currentDate);
      // Move to the start of the first week of the month
      displayStartDate.value.setDate(1);
      displayStartDate.value.setDate(displayStartDate.value.getDate() - displayStartDate.value.getDay());
      
      displayEndDate.value = new Date(displayStartDate.value);
      displayEndDate.value.setDate(displayStartDate.value.getDate() + 7 * 8); // 8 weeks
      cellWidth.value = 140; // Wider cells for weeks
      break;
  }
};

// Watch for changes in month/year to update displayed dates
watch([currentMonth, currentYear], () => {
  updateDateRangeForView();
});

// Watch for changes in view to adjust the cell width and date range
watch(currentView, () => {
  updateDateRangeForView();
});

// Navigation functions
// Добавляем переменные для отслеживания состояния загрузки


const navigatePrevious = () => {
  switch (currentView.value) {
    case 'hours':
      // Navigate back 3 days in hours view
      displayStartDate.value.setDate(displayStartDate.value.getDate() - 3);
      displayEndDate.value.setDate(displayEndDate.value.getDate() - 3);
      updateMonthYearFromDates();
      break;
      
    case 'days':
      // Navigate back 1 month in days view
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else {
        currentMonth.value--;
      }
      break;
      
    case 'weeks':
      // Navigate back 4 weeks in weeks view
      displayStartDate.value.setDate(displayStartDate.value.getDate() - 28);
      displayEndDate.value.setDate(displayEndDate.value.getDate() - 28);
      updateMonthYearFromDates();
      break;
  }
};

const navigateNext = () => {
  switch (currentView.value) {
    case 'hours':
      // Navigate forward 3 days in hours view
      displayStartDate.value.setDate(displayStartDate.value.getDate() + 3);
      displayEndDate.value.setDate(displayEndDate.value.getDate() + 3);
      updateMonthYearFromDates();
      break;
      
    case 'days':
      // Navigate forward 1 month in days view
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else {
        currentMonth.value++;
      }
      break;
      
    case 'weeks':
      // Navigate forward 4 weeks in weeks view
      displayStartDate.value.setDate(displayStartDate.value.getDate() + 28);
      displayEndDate.value.setDate(displayEndDate.value.getDate() + 28);
      updateMonthYearFromDates();
      break;
  }
};
const goToToday = () => {
  const today = new Date();
  currentMonth.value = today.getMonth();
  currentYear.value = today.getFullYear();
  
  // Ensure the view updates to show today
  nextTick(() => {
    // Center the view on today
    if (ganttContainer.value) {
      centerViewOnDate(today);
    }
  });
};

const centerViewOnDate = (date) => {
  if (!ganttContainer.value) return;
  
  setTimeout(() => {
    let scrollPos = 0;
    const clientWidth = ganttContainer.value.clientWidth;
    
    if (currentView.value === 'hours') {
      // For hours view, find the hour that corresponds to the current time
      const hourIndex = visibleHours.value.findIndex(h => 
        h.date.getDate() === date.getDate() && 
        h.date.getMonth() === date.getMonth() && 
        h.date.getFullYear() === date.getFullYear() &&
        h.hour === Math.floor(date.getHours() / 2) * 2 // Round to nearest 2-hour slot
      );
      
      if (hourIndex >= 0) {
        scrollPos = hourIndex * cellWidth.value - clientWidth / 2;
      }
    } else if (currentView.value === 'days') {
      // For days view, find the index of today
      const dayIndex = visibleDates.value.findIndex(d => 
        d.getDate() === date.getDate() && 
        d.getMonth() === date.getMonth() && 
        d.getFullYear() === date.getFullYear()
      );
      
      if (dayIndex >= 0) {
        scrollPos = dayIndex * cellWidth.value - clientWidth / 2;
      }
    } else if (currentView.value === 'weeks') {
      // For weeks view, find the index of the week containing today
      const weekIndex = visibleWeeks.value.findIndex(w => {
        const weekStart = new Date(w.start);
        const weekEnd = new Date(w.end);
        return date >= weekStart && date <= weekEnd;
      });
      
      if (weekIndex >= 0) {
        scrollPos = weekIndex * cellWidth.value - clientWidth / 2;
      }
    }
    
    ganttContainer.value.scrollLeft = Math.max(0, scrollPos);
  }, 100);
};

const updateMonthYearFromDates = () => {
  // Update month/year based on middle date of current view
  const middleDate = new Date(displayStartDate.value);
  
  if (currentView.value === 'weeks') {
    middleDate.setDate(middleDate.getDate() + 14);
  } else if (currentView.value === 'hours') {
    middleDate.setDate(middleDate.getDate() + 1);
  }
  
  currentMonth.value = middleDate.getMonth();
  currentYear.value = middleDate.getFullYear();
};

// Date formatting utilities
const formatMonth = (date) => {
  return months[date.getMonth()].substring(0, 3) + ' ' + date.getFullYear();
};

const formatDay = (date) => {
  return weekdays[date.getDay()];
};

const formatHour = (hour) => {
  return `${hour}:00`;
};

const formatShortDate = (date) => {
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const formatDateRange = (start, end) => {
  return `${start.getDate()}-${end.getDate()}`;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Date checks
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

const isCurrentHour = (date, hour) => {
  const now = new Date();
  return isToday(date) && now.getHours() === hour;
};

const isCurrentWeek = (weekStart) => {
  const today = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return today >= weekStart && today <= weekEnd;
};

// Item data retrieval
const getItemTitle = (item) => {
  // If using the product field from your data
  if (item.productDetails && item.productDetails.name) {
    return item.productDetails.name;
  }
  
  // Fallback to the standard title property
  return item[props.titleKey] || 'Unnamed Item';
};

const getStatusClass = (item) => {
  // If it's a group object
  if (item.status) {
    return `status-${item.status.toLowerCase()}`;
  }
  
  // If it's an individual item
  const status = item[props.statusKey] || 'default';
  return `status-${status.toLowerCase()}`;
};

const getBarStatusClass = (item) => {
  const status = item[props.statusKey] || 'default';
  return `gantt-bar-${status.toLowerCase()}`;
};

// Calculate bar positions for each item
// Add this computed property to group items by product name
const groupedItems = computed(() => {
  const groups = {};
  
  props.items.forEach(item => {
    const title = getItemTitle(item);
    if (!groups[title]) {
      groups[title] = {
        title,
        items: [],
        status: item[props.statusKey] || 'default' // Use the status from the first item with this title
      };
    }
    groups[title].items.push(item);
  });
  
  return Object.values(groups);
});

const organizeBarsIntoRows = (bars) => {
  if (!bars.length) return [];
  
  // Sort bars by start date
  bars.sort((a, b) => a.start - b.start);
  
  const rows = [];
  
  // Place each bar in the first row where it doesn't overlap
  bars.forEach(bar => {
    let rowIndex = 0;
    let placed = false;
    
    while (!placed) {
      if (!rows[rowIndex]) {
        rows[rowIndex] = [];
        rows[rowIndex].push({...bar, rowIndex});
        placed = true;
      } else {
        // Check if this bar overlaps with any bar in this row
        const overlaps = rows[rowIndex].some(existingBar => {
          return (
            (bar.start <= existingBar.end && bar.end >= existingBar.start)
          );
        });
        
        if (!overlaps) {
          rows[rowIndex].push({...bar, rowIndex});
          placed = true;
        } else {
          rowIndex++;
        }
      }
    }
  });
  
  // Flatten the rows into a single array
  return rows.flat();
};

// Replace the current getItemBars function with this updated version
const getItemBars = (groupData) => {
  const bars = [];
  
  // Process all items in the group
  groupData.items.forEach(item => {
    const startDateStr = item[props.startDateKey];
    const endDateStr = item[props.endDateKey];
    
    if (!startDateStr || !endDateStr) return;
    
    // Parse dates (handle both ISO strings and Date objects)
    let startDate = startDateStr instanceof Date ? new Date(startDateStr) : new Date(startDateStr);
    let endDate = endDateStr instanceof Date ? new Date(endDateStr) : new Date(endDateStr);
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
    
    // Fix dates if endDate is before startDate
    if (endDate < startDate) {
      [startDate, endDate] = [endDate, startDate];
    }
    
    // Check if item is within visible range
    if (endDate < displayStartDate.value || startDate > displayEndDate.value) return;
    
    let left, width;
    
    // Calculate position and width based on the current view
    if (currentView.value === 'hours') {
      const hourMilliseconds = 60 * 60 * 1000;
      const firstVisibleDate = new Date(visibleHours.value[0].date);
      firstVisibleDate.setHours(visibleHours.value[0].hour, 0, 0, 0);
      
      // Clamp dates to visible range
      const visibleStartDate = startDate < displayStartDate.value ? displayStartDate.value : startDate;
      const visibleEndDate = endDate > displayEndDate.value ? displayEndDate.value : endDate;
      
      // Calculate hours difference (for 2-hour slots)
      const startHoursDiff = Math.max(0, (visibleStartDate - firstVisibleDate) / hourMilliseconds) / 2;
      const endHoursDiff = Math.max(0, (visibleEndDate - firstVisibleDate) / hourMilliseconds) / 2;
      
      left = startHoursDiff * cellWidth.value;
      width = Math.max((endHoursDiff - startHoursDiff) * cellWidth.value, cellWidth.value);
    } 
    else if (currentView.value === 'days') {
      const dayMilliseconds = 24 * 60 * 60 * 1000;
      const firstVisibleDate = new Date(visibleDates.value[0]);
      firstVisibleDate.setHours(0, 0, 0, 0);
      
      // Clamp dates to visible range
      const visibleStartDate = startDate < displayStartDate.value ? displayStartDate.value : startDate;
      const visibleEndDate = endDate > displayEndDate.value ? displayEndDate.value : endDate;
      
      const startDaysDiff = Math.max(0, Math.floor((visibleStartDate - firstVisibleDate) / dayMilliseconds));
      const endDaysDiff = Math.max(0, Math.floor((visibleEndDate - firstVisibleDate) / dayMilliseconds));
      
      left = startDaysDiff * cellWidth.value;
      width = Math.max((endDaysDiff - startDaysDiff + 1) * cellWidth.value, cellWidth.value);
    }
    else if (currentView.value === 'weeks') {
      const dayMilliseconds = 24 * 60 * 60 * 1000;
      const firstVisibleWeekStart = new Date(visibleWeeks.value[0].start);
      
      // Clamp dates to visible range
      const visibleStartDate = startDate < displayStartDate.value ? displayStartDate.value : startDate;
      const visibleEndDate = endDate > displayEndDate.value ? displayEndDate.value : endDate;
      
      // Calculate week index
      const startWeekIndex = Math.floor((visibleStartDate - firstVisibleWeekStart) / (7 * dayMilliseconds));
      const endWeekIndex = Math.floor((visibleEndDate - firstVisibleWeekStart) / (7 * dayMilliseconds));
      
      left = startWeekIndex * cellWidth.value;
      width = Math.max((endWeekIndex - startWeekIndex + 1) * cellWidth.value, cellWidth.value);
    }
    
    bars.push({
      item,
      start: startDate,
      end: endDate,
      left,
      width
    });
  });
  
  // Organize bars into rows to prevent overlapping
  return organizeBarsIntoRows(bars);
};

// Add a new CSS variable for the height of each bar
const rowHeight = ref(22); // Height in pixels for each bar

// Scroll handling for infinite loading
let isLoadingLeft = false;
let isLoadingRight = false;
let scrollThrottle = null;

const handleScroll = () => {
  if (!ganttContainer.value) return;
  
  // Отменяем предыдущий отложенный вызов, если он есть
  if (scrollThrottle) {
    clearTimeout(scrollThrottle);
  }
  
  // Используем throttle для ограничения частоты вызовов
  scrollThrottle = setTimeout(() => {
    const container = ganttContainer.value;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // Sync timeline header with body scroll
    if (timelineHeader.value) {
      // timelineHeader.value.style.transform = `translateX(-${scrollLeft}px)`;
    }
    
    // Load more data when scrolling near the edges
    if (scrollLeft < 10 && !isLoadingLeft) {
      // Near left edge, load earlier dates
      isLoadingLeft = true;
      
      let newStartDate;
      
      if (currentView.value === 'hours') {
        newStartDate = new Date(displayStartDate.value);
        newStartDate.setDate(newStartDate.getDate() - 3);
      } else if (currentView.value === 'days') {
        newStartDate = new Date(displayStartDate.value);
        newStartDate.setMonth(newStartDate.getMonth() - 1);
      } else if (currentView.value === 'weeks') {
        newStartDate = new Date(displayStartDate.value);
        newStartDate.setDate(newStartDate.getDate() - 28);
      }
      
      // navigatePrevious();
      emit('load-more', { direction: 'backward', date: newStartDate });
      
      // Сбросить флаг загрузки после задержки
      setTimeout(() => {
        isLoadingLeft = false;
      }, 500); // Предотвращаем повторную загрузку в течение 500 мс
      
    } else if (scrollWidth - (scrollLeft + clientWidth) < 10 && !isLoadingRight) {
      // Near right edge, load later dates
      isLoadingRight = true;
      
      let newEndDate;
      
      if (currentView.value === 'hours') {
        newEndDate = new Date(displayEndDate.value);
        newEndDate.setDate(newEndDate.getDate() + 3);
      } else if (currentView.value === 'days') {
        newEndDate = new Date(displayEndDate.value);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (currentView.value === 'weeks') {
        newEndDate = new Date(displayEndDate.value);
        newEndDate.setDate(newEndDate.getDate() + 28);
      }
      
      // navigateNext();
      emit('load-more', { direction: 'forward', date: newEndDate });
      
      // Сбросить флаг загрузки после задержки
      setTimeout(() => {
        isLoadingRight = false;
      }, 500); // Предотвращаем повторную загрузку в течение 500 мс
    }
  }, 100); // Задержка в 100 мс перед обработкой скролла
};

// Initialize component
onMounted(() => {
  // Set initial view
  switchView('days');
  
  // Center timeline on current month
  goToToday();
  
  // Set initial scroll position to today
  nextTick(() => {
    if (ganttContainer.value) {
      const today = new Date();
      centerViewOnDate(today);
    }
  });
});
</script>

<style scoped>
.gantt-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
}


.gantt-chart {
  position: relative;
  height: 500px;
  overflow: auto;
  border: 1px solid #eee;
}

.gantt-header {
  position: sticky;
  top: 0;
  z-index: 2;
/*  background-color: #f8f9fa;*/
/*  box-shadow: 0 2px 4px rgba(0,0,0,0.05);*/
}

.gantt-header-row {
  display: flex;
  position: relative;
}

.gantt-timeline-header {
  display: flex;
  position: sticky;
  left: 200px;
}

.product-column {
  width: 200px;
  min-width: 200px;
  position: sticky;
  left: 0;
/*  z-index: 1;*/
  background-color: #f8f9fa;
  border-right: 1px solid #eee;
  padding: 8px;
}

.gantt-header-cell {
  min-width: var(--cell-width, 60px);
  width: var(--cell-width, 60px);
  border-right: 1px solid #eee;
  text-align: center;
  padding: 8px 4px;
  overflow: hidden;
}

.gantt-header-cell.is-weekend {
  background-color: #f1f3f5;
}

.gantt-header-cell.is-today {
  background-color: #e3f2fd;
}

.gantt-header-cell.is-month-start {
  border-left: 2px solid #adb5bd;
}

.date-label {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.month-label {
  font-weight: bold;
  font-size: 12px;
  width: 100%;
}

.day-number {
  font-weight: bold;
  font-size: 16px;
}

.day-name {
  font-size: 12px;
  color: #6c757d;
}

.gantt-body {
  position: relative;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid #eee;
}



.gantt-row.is-even .gantt-timeline-row {
   background-color: #f8f9fa;
}

.gantt-row-item {
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  font-weight: bold;
  margin-bottom: 4px;
  text-wrap-mode: nowrap;
  width: 100%;
  overflow: hidden;
}

.product-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.status-active {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-completed {
  background-color: #cff4fc;
  color: #055160;
}

.status-canceled {
  background-color: #f8d7da;
  color: #842029;
}

.status-default {
  background-color: #e2e3e5;
  color: #41464b;
}

.gantt-timeline-row {
  display: flex;
  position: relative;
  height: 60px;
  flex-grow: 1;
}

.gantt-cell {
  min-width: var(--cell-width, 60px);
  width: var(--cell-width, 60px);
  border-right: 1px solid #eee;
  height: 100%;
}

.gantt-cell.is-weekend {
  background-color: #f1f3f5;
}

.gantt-cell.is-today {
  background-color: #e3f2fd;
}

.gantt-bar {
  position: absolute;
  height: 40px;
  top: 10px;
  border-radius: 4px;
  background-color: #4dabf7;
  color: white;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 4px 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, transform 0.1s;
}

.gantt-bar:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.gantt-bar-active {
  background-color: #4dabf7;
}

.gantt-bar-completed {
  background-color: #20c997;
}

.gantt-bar-canceled {
  background-color: #fa5252;
  text-decoration: line-through;
}

.gantt-bar-label {
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-controls button, 
.date-controls button,
.date-controls select {
  border: 1px solid #dee2e6;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-controls button:hover, 
.date-controls button:hover,
.date-controls select:hover {
  background-color: #e9ecef;
}

.flex-v-center {
  display: flex;
  align-items: center;
}

/* Set cell width based on current view */
:root {
  --cell-width: v-bind('cellWidth.value + "px"');
}
</style>