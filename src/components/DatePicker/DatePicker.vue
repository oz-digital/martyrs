<template>
  <div>
    <div 
      class="w-100 scroller o-scroll scroll-snap-type-x-mandatory scroll-pd-regular scroll-hide flex-nowrap flex" 
      ref="scrollContainer"
    >
      <div 
        v-for="date in dates" 
        :key="date.toString()" 
        @click="selectDate(date)"
        :class="{
          'selected': selectedDate && selectedDate.toDateString() === date.toDateString(),
          'highlighted': isHighlighted(date)
        }"
        class="cursor-pointer scroll-snap-align-start mn-r-small mn-l-small flex-column flex-center flex"
      >
        <span class="t-transp">
          {{ dayLetter(date) }}
        </span>
        <span 
          :class="{
            'bg-main': selectedDate && selectedDate.toDateString() === date.toDateString(),
             'br-1px br-solid br-main':isHighlighted(date),
          }"
          class="transition-ease-in-out t-semi flex-center flex radius-big i-semi day-number"
        >
          {{ date.getDate() }}
        </span>
      </div>
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
    weekday: 'narrow' 
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