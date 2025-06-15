<template>
  <div 
    @click="handleClick"
    class="cursor-pointer flex-center flex"
  >
    <IconDate class="w-1r h-auto"/>
    <span class="desktop-only mn-l-thin t-semi">{{ formattedDate }}</span>
  </div>
</template>

<script setup>
import { toRefs, computed } from 'vue';
import IconDate from '@martyrs/src/modules/icons/entities/IconDate.vue'

const props = defineProps({
  action: {
    type: Function,
  },
  date: {
    type: Object
  }
});

const { action, date } = toRefs(props);

const formattedDate = computed(() => formatDate(date.value));

const handleClick = () => {
  if (action.value) action.value();
};

function formatDate(dateObj) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const { start, end } = dateObj;

  if (start === null && end === null) {
    return `All Time`;
  }

  const startDate = new Date(start);
  const startDay = startDate.getUTCDate(); // Используем getUTCDate() для дня
  const startMonth = months[startDate.getUTCMonth()]; // Используем getUTCMonth() для месяца
  const startYear = startDate.getUTCFullYear(); // Используем getUTCFullYear() для года

  if (!end) {
    // Если нет end, выводим полную дату для start
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const endDate = new Date(end);
  const endDay = endDate.getUTCDate(); // Используем getUTCDate() для дня
  const endMonth = months[endDate.getUTCMonth()]; // Используем getUTCMonth() для месяца
  const endYear = endDate.getUTCFullYear(); // Используем getUTCFullYear() для года

  // Если есть start и end, для start не выводим год, а для end выводим
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
}

</script>