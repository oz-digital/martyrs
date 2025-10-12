<script setup>
  import { computed, ref, watch } from 'vue'

  const props = defineProps({
    modelValue: [Date, Object],
    allowRange: Boolean,
    disabled: Boolean,
    enableTime: {
      type: Boolean,
      default: false
    },
    disablePastDates: {
      type: Boolean,
      default: false
    },
    disabledRanges: {
      type: Array,
      default: () => []
    },
    availabilityData: {
      type: Array,
      default: () => []
    },
    showAvailability: {
      type: Boolean,
      default: false
    },
    lowAvailabilityThreshold: {
      type: Number,
      default: 3
    },
    requiredQuantity: {
      type: Number,
      default: 1
    },
    locale: {
      type: String,
      default: 'en'
    },
    showSelected: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'select', 'cancel'])

  const dateCalendar = defineModel('date')

  const today = new Date()
  const currentDate = ref(today)
  const selectedDate = ref(null)
  const startDate = ref(null)
  const endDate = ref(null)
  const tooltip = ref({ show: false, message: '', x: 0, y: 0 })

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Watch for availability data updates
  watch(() => props.availabilityData, (newData) => {
    // You could perform additional processing when availability data changes
  }, { deep: true })

  const toUTC = (date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  }

  const toEndOfDayUTC = (date) => {
    const endOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));
    return endOfDay;
  }

  const dateToString = (date) => {
    return date.toISOString().split('T')[0];
  }

  const monthYear = computed(() => {
    const month = currentDate.value.toLocaleString(props.locale, { month: 'long', timeZone: 'UTC' })
    const year = currentDate.value.getUTCFullYear()
    return `${month} ${year}`
  })

  const isPrevMonthDisabled = computed(() => {
    if (!props.disablePastDates) return false;
    
    // Check if current view month is the current month
    return currentDate.value.getUTCMonth() === today.getUTCMonth() && 
           currentDate.value.getUTCFullYear() === today.getUTCFullYear();
  })

  const daysInMonth = computed(() => {
    const days = []
    const firstDay = new Date(Date.UTC(
      currentDate.value.getUTCFullYear(),
      currentDate.value.getUTCMonth(),
      1
    ))
    const lastDay = new Date(Date.UTC(
      currentDate.value.getUTCFullYear(),
      currentDate.value.getUTCMonth() + 1,
      0
    ))

    const firstDayOfWeek = firstDay.getUTCDay()

    let date = new Date(firstDay)

    date.setUTCDate(date.getUTCDate() - firstDayOfWeek)

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        date: new Date(date),
        day: date.getUTCDate(),
        isToday: isToday(date),
      })
      date.setUTCDate(date.getUTCDate() + 1)
    }

    let day = 1

    for (date = firstDay; date <= lastDay; date.setUTCDate(date.getUTCDate() + 1)) {
      days.push({
        date: new Date(date),
        day,
        isToday: isToday(date),
      })
      day++
    }

    const lastDayOfWeek = days[days.length - 1].date.getUTCDay()

    for (let i = lastDayOfWeek + 1; i <= 6; i++) {
      days.push({
        date: new Date(date),
        day: date.getUTCDate(),
        isToday: isToday(date),
      })
      date.setUTCDate(date.getUTCDate() + 1)
    }

    return days
  })

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getUTCDate() === today.getUTCDate() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCFullYear() === today.getUTCFullYear()
    )
  }

  const isSameMonth = (date) => {
    return (
      date.getUTCMonth() === currentDate.value.getUTCMonth() &&
      date.getUTCFullYear() === currentDate.value.getUTCFullYear()
    )
  }

  const isPastDate = (date) => {
    if (!props.disablePastDates) return false;

    const now = new Date();
    // Compare only dates without time
    const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const compareDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    return compareDate < todayDate;
  }

  const isDateTimeInDisabledRange = (date) => {
    if (!props.disabledRanges || props.disabledRanges.length === 0) return false;

    const checkDate = new Date(date);

    for (const range of props.disabledRanges) {
      if (!range.start || !range.end) continue;

      const rangeStart = new Date(range.start);
      const rangeEnd = new Date(range.end);

      if (checkDate >= rangeStart && checkDate <= rangeEnd) {
        return true;
      }
    }

    return false;
  }

  const isDisabledDate = (date) => {
    return isDateTimeInDisabledRange(date);
  }

  const getAvailabilityInfo = (date) => {
    if (!props.availabilityData || props.availabilityData.length === 0) return null;
    
    const dateStr = dateToString(date);
    return props.availabilityData.find(item => item.date === dateStr);
  }

  const isAvailable = (date) => {
    if (!props.availabilityData || props.availabilityData.length === 0) return true;
    
    const availabilityInfo = getAvailabilityInfo(date);
    return !availabilityInfo || availabilityInfo.availableQuantity > 0;
  }

  const isLowAvailability = (date) => {
    if (!props.availabilityData || props.availabilityData.length === 0) return false;
    
    const availabilityInfo = getAvailabilityInfo(date);
    return availabilityInfo && 
           availabilityInfo.availableQuantity > 0 && 
           availabilityInfo.availableQuantity <= props.lowAvailabilityThreshold;
  }

  const getAvailability = (date) => {
    if (!props.showAvailability) return null;
    
    const availabilityInfo = getAvailabilityInfo(date);
    return availabilityInfo ? availabilityInfo.availableQuantity : null;
  }

  const isSelected = (date) => {
    if (props.allowRange) {
      if (startDate.value && endDate.value) {
        return date >= new Date(startDate.value) && toEndOfDayUTC(date) <= new Date(endDate.value);
      } else if (startDate.value) {
        return date.getTime() === new Date(startDate.value).getTime();
      }
    } else {
      return selectedDate.value && date.getTime() === new Date(selectedDate.value).getTime();
    }
  }

  const isInRange = (date) => {
    if (startDate.value && endDate.value) {
      return date > startDate.value && toEndOfDayUTC(date) < endDate.value
    }
    return false
  }

  const selectDate = (date, event) => {
    // Don't allow selection of past dates, disabled dates or unavailable dates
    if (props.disablePastDates && isPastDate(date)) return;
    if (isDisabledDate(date)) return;
    if (!isAvailable(date)) return;
    
    // Check if date has sufficient quantity for required amount
    const availabilityInfo = getAvailabilityInfo(date);
    if (availabilityInfo && availabilityInfo.availableQuantity < props.requiredQuantity) {
      // Show tooltip with insufficient quantity message
      if (event) {
        tooltip.value = {
          show: true,
          message: `Insufficient quantity. Available: ${availabilityInfo.availableQuantity}, needed: ${props.requiredQuantity}`,
          x: event.clientX,
          y: event.clientY
        };
        setTimeout(() => {
          tooltip.value.show = false;
        }, 3000);
      }
      return;
    }
    
    // Hide tooltip if it was showing
    tooltip.value.show = false;
    
    // If selecting a date from another month, switch to that month
    if (!isSameMonth(date)) {
      // currentDate.value = new Date(Date.UTC(
      //   date.getUTCFullYear(),
      //   date.getUTCMonth(),
      //   1
      // ));
    }
    
    const formattedDate = toUTC(date)

    if (!props.allowRange) {
      // If same date is clicked and time is enabled, don't change anything
      // This allows user to modify only time without reselecting date
      if (props.enableTime && selectedDate.value) {
        const existingDate = new Date(selectedDate.value);
        if (existingDate.getFullYear() === date.getFullYear() &&
            existingDate.getMonth() === date.getMonth() &&
            existingDate.getDate() === date.getDate()) {
          return;
        }
      }
      selectedDate.value = formattedDate
      dateCalendar.value = formattedDate
    } else if (!startDate.value && !endDate.value) {
      startDate.value = formattedDate
      dateCalendar.value = { start: formattedDate, end: null }
    } else if (!endDate.value) {
      endDate.value = toEndOfDayUTC(date)
      if (formattedDate < startDate.value) {
        const temp = toEndOfDayUTC(startDate.value)
        startDate.value = formattedDate
        endDate.value = temp
      }
      // Verify all dates in the range are available
      if (props.availabilityData && props.availabilityData.length > 0) {
        let allDatesAvailable = true;
        let currentDate = new Date(startDate.value);
        
        while (currentDate <= endDate.value) {
          if (!isAvailable(currentDate)) {
            allDatesAvailable = false;
            break;
          }
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        if (!allDatesAvailable) {
          // Instead of resetting the end date, start a new range
          startDate.value = formattedDate
          endDate.value = null
          dateCalendar.value = { start: formattedDate, end: null }
          return;
        }
      }
      dateCalendar.value = { start: startDate.value, end: endDate.value }
    } else {
      startDate.value = formattedDate
      endDate.value = null
      dateCalendar.value = { start: formattedDate, end: null }
    }
  }

  const prevMonth = () => {
    // Prevent navigating to past months if disablePastDates is true
    if (props.disablePastDates) {
      const newDate = new Date(Date.UTC(
        currentDate.value.getUTCFullYear(),
        currentDate.value.getUTCMonth() - 1,
        1
      ));
      
      if (newDate.getUTCFullYear() < today.getUTCFullYear() || 
          (newDate.getUTCFullYear() === today.getUTCFullYear() && 
           newDate.getUTCMonth() < today.getUTCMonth())) {
        return;
      }
    }
    
    currentDate.value = new Date(Date.UTC(
      currentDate.value.getUTCFullYear(),
      currentDate.value.getUTCMonth() - 1,
      1
    ));
  }

  const nextMonth = () => {
    currentDate.value = new Date(Date.UTC(
      currentDate.value.getUTCFullYear(),
      currentDate.value.getUTCMonth() + 1,
      1
    ))
  }

  const selectToday = () => {
    const today = new Date();  
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0)); 
    const todayEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999)); 

    // Check if today is available
    if (props.disablePastDates || isAvailable(todayStart)) {
      startDate.value = todayStart.toISOString();
      endDate.value = todayEnd.toISOString();
      dateCalendar.value = { start: startDate.value, end: endDate.value };
    }
  }

  const selectLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setUTCDate(today.getUTCDate() - 7);
    lastWeek.setUTCHours(0, 0, 0, 0);

    // Skip if disablePastDates is true
    if (props.disablePastDates) return;

    startDate.value = lastWeek;
    endDate.value = toEndOfDayUTC(today);
    
    today.setUTCHours(23, 59, 59, 999);

    const start = lastWeek.toISOString();
    const end = today.toISOString();
    
    dateCalendar.value = { start: start, end: end };
  }

  const selectLastMonth = () => {
    const today = new Date();
    
    // Skip if disablePastDates is true
    if (props.disablePastDates) return;
    
    // Create date for last month
    const lastMonth = new Date(today);
    lastMonth.setUTCMonth(today.getUTCMonth() - 1);
    lastMonth.setUTCHours(0, 0, 0, 0);
    
    startDate.value = lastMonth;
    endDate.value = toEndOfDayUTC(today);

    today.setUTCHours(23, 59, 59, 999);
    
    const start = lastMonth.toISOString();
    const end = today.toISOString();
    
    dateCalendar.value = { start: start, end: end };
  }

  const selectLastYear = () => {
    // Skip if disablePastDates is true
    if (props.disablePastDates) return;

    startDate.value = null;
    endDate.value = null;
    dateCalendar.value = { start: null, end: null };
  }

  // Time selection computed properties
  const displayHours = computed(() => {
    if (!props.enableTime) return 0;
    if (selectedDate.value) {
      return selectedDate.value.getHours();
    }
    return new Date().getHours();
  })

  const displayMinutes = computed(() => {
    if (!props.enableTime) return 0;
    if (selectedDate.value) {
      return selectedDate.value.getMinutes();
    }
    return new Date().getMinutes();
  })

  const minHours = computed(() => {
    if (!props.disablePastDates) return 0;
    if (selectedDate.value && isToday(selectedDate.value)) {
      return new Date().getHours();
    }
    return 0;
  })

  const minMinutes = computed(() => {
    if (!props.disablePastDates) return 0;
    if (selectedDate.value && isToday(selectedDate.value)) {
      const currentHour = new Date().getHours();
      if (displayHours.value === currentHour) {
        return new Date().getMinutes();
      }
    }
    return 0;
  })

  const updateTime = (hours, minutes) => {
    if (!props.enableTime || !selectedDate.value) return;

    hours = parseInt(hours) || 0;
    minutes = parseInt(minutes) || 0;

    // Validate hours and minutes
    if (hours < 0) hours = 0;
    if (hours > 23) hours = 23;
    if (minutes < 0) minutes = 0;
    if (minutes > 59) minutes = 59;

    // Check if time is in the past for today
    if (props.disablePastDates && isToday(selectedDate.value)) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (hours < currentHour || (hours === currentHour && minutes < currentMinute)) {
        hours = currentHour;
        minutes = currentMinute;
      }
    }

    const newDate = new Date(selectedDate.value);
    newDate.setHours(hours, minutes, 0, 0);

    // Check if the new date+time falls into disabled range
    if (isDateTimeInDisabledRange(newDate)) {
      return;
    }

    selectedDate.value = newDate;
    dateCalendar.value = newDate;
  }

  const formattedSelectedDate = computed(() => {
    const date = selectedDate.value || (props.allowRange ? startDate.value : null);
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let result = `${day}.${month}.${year}`;

    if (props.enableTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      result += ` ${hours}:${minutes}`;
    }

    return result;
  })

  const onCancel = () => {
    emit('cancel');
  }

  const onSelect = () => {
    emit('select');
  }
</script>


<template>
  <div class="t-noselect calendar" :aria-disabled="disabled"> 
     <div v-if="allowRange && !disablePastDates" class="br-b br-solid br-grey-transp-25 gap-thin flex flex-nowrap pd-thin">
      <button @click="selectToday" class="font-second t-nowrap pd-thin bg-white radius-small">Today</button>
      <button @click="selectLastWeek" class="font-second t-nowrap pd-thin bg-white radius-small">Last Week</button>
      <button @click="selectLastMonth" class="font-second t-nowrap pd-thin bg-white radius-small">Last Month</button>
      <button @click="selectLastYear" class="font-second t-nowrap pd-thin bg-white radius-small">All time</button>
    </div>
    <div class="pd-thin flex flex-nowrap flex-v-center flex-justify-between">
      <button @click.stop="prevMonth" class="aspect-1x1 pd-thin bg-white radius-extra" :disabled="isPrevMonthDisabled">
        <svg class="i-regular" xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path d="M0.610352 10.0068C0.615885 9.81315 0.654622 9.63607 0.726562 9.47559C0.798503 9.3151 0.90918 9.16016 1.05859 9.01074L9.37598 0.958984C9.61393 0.721029 9.90723 0.602051 10.2559 0.602051C10.4883 0.602051 10.6986 0.657389 10.8867 0.768066C11.0804 0.878743 11.2326 1.02816 11.3433 1.21631C11.4595 1.40446 11.5176 1.61475 11.5176 1.84717C11.5176 2.19027 11.3875 2.49186 11.1274 2.75195L3.60693 9.99854L11.1274 17.2534C11.3875 17.519 11.5176 17.8206 11.5176 18.1582C11.5176 18.3962 11.4595 18.6092 11.3433 18.7974C11.2326 18.9855 11.0804 19.1349 10.8867 19.2456C10.6986 19.3618 10.4883 19.4199 10.2559 19.4199C9.90723 19.4199 9.61393 19.2982 9.37598 19.0547L1.05859 11.0029C0.903646 10.8535 0.790202 10.6986 0.718262 10.5381C0.646322 10.3721 0.610352 10.195 0.610352 10.0068Z" :fill="isPrevMonthDisabled ? '#303030' : '#007AFF'"/>
        </svg>
      </button>
      <span class="t-semi">{{ monthYear }}</span>
      <button @click.stop="nextMonth" class="aspect-1x1 pd-thin bg-white radius-extra">
        <svg class="i-regular " xmlns="http://www.w3.org/2000/svg" width="11" height="20" viewBox="0 0 11 20" fill="none">
          <path d="M10.9072 10.0151C10.9017 10.2088 10.863 10.3859 10.791 10.5464C10.7191 10.7069 10.6084 10.8618 10.459 11.0112L2.1416 19.063C1.90365 19.3009 1.61035 19.4199 1.26172 19.4199C1.0293 19.4199 0.81901 19.3646 0.630859 19.2539C0.437175 19.1432 0.284994 18.9938 0.174316 18.8057C0.0581055 18.6175 8.85326e-08 18.4072 1.08852e-07 18.1748C1.38846e-07 17.8317 0.130046 17.5301 0.390137 17.27L7.91065 10.0234L0.390138 2.76855C0.130047 2.50293 1.5053e-06 2.20133 1.53481e-06 1.86377C1.55561e-06 1.62581 0.058107 1.41276 0.174318 1.22461C0.284995 1.03646 0.437176 0.887043 0.630861 0.776366C0.819012 0.660155 1.0293 0.60205 1.26172 0.60205C1.61035 0.60205 1.90365 0.723795 2.1416 0.967284L10.459 9.01904C10.6139 9.16846 10.7274 9.3234 10.7993 9.48389C10.8713 9.6499 10.9072 9.82699 10.9072 10.0151Z" :fill="isPrevMonthDisabled ? '#303030' : '#007AFF'"/>
        </svg>
      </button>
    </div>

    <div class="pd-thin calendar__body">
      <div class="calendar__week">
        <div v-for="(day, index) in daysOfWeek" :key="index" class="calendar__weekday">
          {{ day }}
        </div>
      </div>
      <div class="gap-micro calendar__dates">
        <div
          v-for="day in daysInMonth"
          :key="day.date"
          :class="[
            'flex flex-center cursor-pointer aspect-1x1 radius-small',
            { 'calendar__date--today': day.isToday },
            { 'calendar__date--selected': isSelected(day.date) },
            { 'calendar__date--range': isInRange(day.date) },
            { 'calendar__date--in-other-month': !isSameMonth(day.date) },
            { 'calendar__date--disabled': isPastDate(day.date) || isDisabledDate(day.date) },
            { 'calendar__date--low-availability': isLowAvailability(day.date) },
            { 'calendar__date--unavailable': !isAvailable(day.date) && !isPastDate(day.date) && !isDisabledDate(day.date) },
          ]"
          @click.stop="selectDate(day.date, $event)"
        >
          {{ day.day }}
          <span v-if="showAvailability && getAvailability(day.date)" class="availability-indicator">
            {{ getAvailability(day.date) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Time selection -->
    <div v-if="enableTime" class="pd-thin br-t br-solid br-grey-transp-25 flex gap-thin">
      <input
        type="number"
        :value="displayHours"
        @input="updateTime($event.target.value, displayMinutes)"
        :min="minHours"
        max="23"
        class="w-50 pd-small radius-small"
        placeholder="HH"
      />
      <input
        type="number"
        :value="displayMinutes"
        @input="updateTime(displayHours, $event.target.value)"
        :min="minMinutes"
        max="59"
        class="w-50 pd-small radius-small"
        placeholder="MM"
      />
    </div>

    <!-- Selected date and actions -->
    <div v-if="showSelected" class="pd-thin br-t br-solid br-grey-transp-25 flex flex-v-center gap-thin">
      <span class="t-transp">selected:</span>
      <span class="flex-1">{{ formattedSelectedDate || '---' }}</span>
      <button @click="onCancel" class="pd-small radius-small bg-white">cancel</button>
      <button @click="onSelect" class="pd-small radius-small bg-black t-white">select</button>
    </div>

    <!-- Tooltip for insufficient quantity -->
    <div 
      v-if="tooltip.show" 
      class="calendar-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.message }}
    </div>
   
  </div>
</template>

<style lang='scss' scoped>
.calendar[aria-disabled="true"] {
  cursor: not-allowed;

  * {
     pointer-events: none;
  }
}
.calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.calendar__weekday {
  text-align: center;
}

.calendar__dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
}

.calendar__dates::before {
  content: '';
  width: 0;
  padding-bottom: 100%;
  grid-row: 1 / 1;
  grid-column: 1 / 1;
}

.calendar__dates > *:first-child {
  grid-row: 1 / 1;
  grid-column: 1 / 1;
}

.calendar__date--today {
  background-color: rgb(var(--main)) !important;
  font-weight: bold;
}

.calendar__date--in-other-month {
  color: #aaaaaa; /* Grey text color for dates from adjacent months */
}

.calendar__date--selected {
  background-color: #007bff !important;
  color: #fff;
}

.calendar__date--range {
  background-color: #1c6ab8 !important;
}

.calendar__date--disabled, .calendar__date--unavailable {
  color: #ccc;
  cursor: not-allowed;
  text-decoration: line-through;
  opacity: 0.5;
}

.calendar__date--low-availability {
  position: relative;
  background-color: #f0f0f0;
/*  border: 1px solid #fff3cd;*/
/*  background-color: #fff3cd;*/
}

.availability-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  color: #6c757d;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-tooltip {
  position: fixed;
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  max-width: 200px;
  word-wrap: break-word;
  pointer-events: none;
  transform: translate(-50%, -100%);
  margin-top: -8px;
}
</style>