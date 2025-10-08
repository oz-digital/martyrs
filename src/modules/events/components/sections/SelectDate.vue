<template>
  <div class="gap-regular radius-medium mn-b-semi">
    <h3 class="mn-b-small">
      {{ title }}
    </h3>
    
    <div class="cols-3 mobile:cols-1 mobile:cols-2 gap-thin">
      <div 
        v-for="(date, index) in computedDateOptions" 
        :key="index"
        class="bg-light radius-medium pd-medium cursor-pointer"
        @click="handleDateSelect(date)"
      >
        <p class="mn-b-small p-medium t-medium">{{ date.label }}</p>
        <div class="p-regular t-transp">{{ date.range }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Explore by Date'
  },
  locale: {
    type: String,
    default: 'en-US'
  },
  labels: {
    type: Object,
    default: () => ({
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeekend: 'This Weekend',
      thisWeek: 'This Week',
      nextWeekend: 'Next Weekend',
      nextWeek: 'Next Week',
      thisMonth: 'This Month',
      customDate: 'Custom Date',
      pickRange: 'Pick Range'
    })
  },
  customDateOptions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['date-selected']);

// Форматирование одиночной даты с месяцем после числа
const formatSingleDate = (date) => {
  // Получаем отдельные форматированные части
  const weekday = new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(date);
  const day = new Intl.DateTimeFormat(props.locale, { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(date);
  
  // Собираем в нужном порядке: день недели, число месяца
  return `${weekday}, ${day} ${month}`;
};

// Форматирование диапазона дат с месяцем после числа
const formatDateRange = (startDate, endDate) => {
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  
  // Форматируем начало и конец диапазона
  const startDay = new Intl.DateTimeFormat(props.locale, { day: 'numeric' }).format(startDate);
  const endDay = new Intl.DateTimeFormat(props.locale, { day: 'numeric' }).format(endDate);
  const startMonth = new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(startDate);
  const endMonth = new Intl.DateTimeFormat(props.locale, { month: 'short' }).format(endDate);
  
  if (sameMonth) {
    // Если один и тот же месяц: "1 - 2 Jan"
    return `${startDay} - ${endDay} ${startMonth}`;
  } else {
    // Если разные месяцы: "30 Dec - 5 Jan"
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
};

// Вспомогательная функция для установки времени на начало дня (00:00:00)
const setStartOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Вспомогательная функция для установки времени на конец дня (23:59:59.999)
const setEndOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const computedDateOptions = computed(() => {
  if (props.customDateOptions.length > 0) {
    return props.customDateOptions;
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Расчет текущих выходных (следующие суббота и воскресенье)
  const thisWeekendStart = new Date(today);
  const daysUntilWeekend = (6 - today.getDay()); // 6 - суббота
  thisWeekendStart.setDate(today.getDate() + (daysUntilWeekend <= 0 ? daysUntilWeekend + 7 : daysUntilWeekend));
  
  const thisWeekendEnd = new Date(thisWeekendStart);
  thisWeekendEnd.setDate(thisWeekendStart.getDate() + 1);
  
  // Расчет текущей недели (воскресенье - суббота)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
  
  // Расчет следующих выходных
  const nextWeekendStart = new Date(thisWeekendStart);
  nextWeekendStart.setDate(nextWeekendStart.getDate() + 7);
  
  const nextWeekendEnd = new Date(nextWeekendStart);
  nextWeekendEnd.setDate(nextWeekendStart.getDate() + 1);
  
  // Расчет следующей недели
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
  
  // Расчет текущего месяца
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return [
    { 
      label: props.labels.today, 
      range: formatSingleDate(today),
      data: { 
        startDate: setStartOfDay(today), 
        endDate: setEndOfDay(today) 
      }
    },
    { 
      label: props.labels.tomorrow, 
      range: formatSingleDate(tomorrow),
      data: { 
        startDate: setStartOfDay(tomorrow), 
        endDate: setEndOfDay(tomorrow) 
      }
    },
    { 
      label: props.labels.thisWeekend, 
      range: formatDateRange(thisWeekendStart, thisWeekendEnd),
      data: { 
        startDate: setStartOfDay(thisWeekendStart), 
        endDate: setEndOfDay(thisWeekendEnd) 
      }
    },
    { 
      label: props.labels.thisWeek, 
      range: formatDateRange(thisWeekStart, thisWeekEnd),
      data: { 
        startDate: setStartOfDay(thisWeekStart), 
        endDate: setEndOfDay(thisWeekEnd) 
      }
    },
    { 
      label: props.labels.nextWeekend, 
      range: formatDateRange(nextWeekendStart, nextWeekendEnd),
      data: { 
        startDate: setStartOfDay(nextWeekendStart), 
        endDate: setEndOfDay(nextWeekendEnd) 
      }
    },
    { 
      label: props.labels.nextWeek, 
      range: formatDateRange(nextWeekStart, nextWeekEnd),
      data: { 
        startDate: setStartOfDay(nextWeekStart), 
        endDate: setEndOfDay(nextWeekEnd) 
      }
    },
    // { 
    //   label: props.labels.thisMonth, 
    //   range: formatDateRange(thisMonthStart, thisMonthEnd),
    //   data: { 
    //     startDate: setStartOfDay(thisMonthStart), 
    //     endDate: setEndOfDay(thisMonthEnd) 
    //   }
    // },
    // { 
    //   label: props.labels.customDate, 
    //   range: props.labels.pickRange,
    //   data: { 
    //     startDate: null, 
    //     endDate: null,
    //     isCustom: true
    //   }
    // }
  ];
});

const handleDateSelect = (date) => {
  emit('date-selected', date.data);
};
</script>

<style lang="scss">
/* Стили остаются неизменными */
</style>