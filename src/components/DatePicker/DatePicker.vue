<template>
  <div>
    <div 
      class="w-100 scroller o-x-scroll o-y-visible scroll-snap-type-x-mandatory scroll-pd-regular scroll-hide flex-nowrap flex" 
      ref="scrollContainer"
    >
      <template v-for="(date, index) in dates" :key="date.toString()">
        <!-- Month separator -->
        <div 
          v-if="index === 0 || dates[index - 1].getMonth() !== date.getMonth()"
          class="mn-r-thin mn-l-thin pd-thin radius-thin flex-column flex-center flex bg-light"
        >
          <span class="t-transp t-noselect p-small mn-b-thin">
            {{ String(date.getMonth() + 1).padStart(2, '0') }}/{{ date.getFullYear() }}
          </span>
          <span class="t-noselect t-semi">
            {{ date.toLocaleDateString(props.locale || 'en', { month: 'short' }).toUpperCase() }}
          </span>
        </div>
        
        <!-- Date -->
        <div 
          @click="selectDate(date)"
          :class="{
            'bg-main t-white': selectedDate && selectedDate.toDateString() === date.toDateString(),
            'bg-second t-white': isHighlighted(date)
          }"
          class="transition-ease-in-out hover-bg-light cursor-pointer o-y-visible scroll-snap-align-start mn-r-thin mn-l-thin pd-thin radius-thin flex-column flex-center flex"
        >
          <span class="t-transp t-noselect p-small mn-b-thin">
            {{ dayLetter(date) }}
          </span>
          <span 
            class="t-noselect t-semi  day-number"
          >
            {{ date.getDate() }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';

const emit = defineEmits();
const props = defineProps(['date', 'options','locale']);

const scrollContainer = ref(null);

// Initialize base date for generating the date range
const baseDate = new Date();
baseDate.setHours(0, 0, 0, 0);

// Initialize selectedDate as null or with provided date
const selectedDate = ref(null);

if (props.date) {
  const day = parseInt(props.date.substring(0, 2));
  const month = parseInt(props.date.substring(2, 4)) - 1;
  const year = parseInt(props.date.substring(4));

  selectedDate.value = new Date(year, month, day);
  selectedDate.value.setHours(0, 0, 0, 0);
}

const dates = generateDates(baseDate, props.options.dateEnd || 30);

onMounted(() => {
  if (scrollContainer.value) {
    const target = scrollContainer.value.getElementsByClassName('selected')[0] || 
                  scrollContainer.value.getElementsByClassName('bg-main')[0] || 
                  scrollContainer.value.getElementsByClassName('highlighted')[0];
    if (target) {
      scrollContainer.value.scrollLeft = target.offsetLeft - 
        scrollContainer.value.offsetWidth / 2 + target.offsetWidth / 2;
    }
  }
});

function selectDate(date) {
  if (selectedDate.value && selectedDate.value.toDateString() === date.toDateString()) {
    // If clicking the same date, reset selection
    selectedDate.value = null;
    emit('update:date', null);
  } else {
    // Select new date
    selectedDate.value = date;
    const formattedDate = formatDateForRouter(date);
    emit('update:date', date);
  }
}

function isHighlighted(date) {
  return selectedDate.value === null && date.toDateString() === baseDate.toDateString();
}

function formatDateForRouter(date) {
  return `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1)
    .toString().padStart(2, '0')}${date.getFullYear()}`;
}

function dayLetter(date) {
  return date.toLocaleDateString(props.locale ? props.locale : 'en', { 
    weekday: 'short' 
  }).toUpperCase();
}

function generateDates(start, count) {
  const dates = [];
  for (let i = props.options.dateStart || 0; i < count - props.options.dateStart || 0; i++) {
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    newDate.setHours(0, 0, 0, 0);
    dates.push(newDate);
  }
  return dates;
}
</script>