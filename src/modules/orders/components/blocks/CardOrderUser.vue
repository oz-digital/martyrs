<template>
  <div class="w-100">
    <!-- Главный контейнер -->
    <div class="bg-light radius-tl-medium radius-tr-medium pd-thin gap-small flex-v-center flex-nowrap flex"
    	:class="{
    		'radius-bl-medium radius-br-medium': !showReturnNotice
    	}"
    >
      <!-- Левая часть - сетка фотографий -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr" class="flex-child-default gap-micro h-max-5r aspect-1x1">
			  <template v-if="positions.length > 0">
			    <div 
			      v-for="index in 4" 
			      :key="index" 
            style="min-height: 0"
			      class="w-100 h-100 bg-white-transp-50 radius-thin"
			      :class="{
			        'bg-white-transp-50': index <= positions.length && index <= 3,
			        'bg-white-transp-50': index > positions.length || (index === 4 && positions.length <= 3),
			        'bg-main': index === 4 && positions.length > 3
			      }"
			    >
			     <img 
						  v-if="index > 0 && index <= positions.length && positions[index - 1]?.images?.[0]" 
						  :src="`${FILE_SERVER_URL || ''}${positions[index - 1].images[0] || positions[index - 1].image}`" 
						  class="radius-small object-fit-contain w-100 h-100" 
						  :alt="positions[index - 1].name" 
					>
			      <div v-else-if="index === 4 && positions.length > 3" class="flex-center h-100">
			        <span class="t-medium t-white">+{{ positions.length - 3 }}</span>
			      </div>
			    </div>
			  </template>
			</div>

      <!-- Правая часть - контент -->
      <div class="flex-column flex w-100">
        <!-- ID заказа и цена -->
        <div class="mn-b-thin">
          <Tooltip :text="orderId">
			      <p class="p-semi">
			        #{{ orderId.slice(0, 4) }}...{{ orderId.slice(-4) }}
			      </p>
			    </Tooltip>
          <p class="t-transp">{{ positions.length }} items for {{ formatPrice(total) }}</p>
        </div>

        <!-- Оставшееся время -->
        <div class="flex-nowrap radius-thin bg-white w-max pd-thin flex-v-center flex">
					<component :is="statusIcon" class="t-transp" />
			    <span class="mn-l-micro p-medium">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <!-- Уведомление о возврате -->
    <div 
		  v-if="showReturnNotice" 
		  :class="[
		    'flex-nowrap', 
		    'flex-v-center', 
		    'flex', 
		    'pd-regular', 
		    'radius-bl-medium', 
		    'radius-br-medium',
		    hasOverdue ? 'bg-fourth-nano' : 'bg-second-nano'
		  ]"
		>
		  <svg 
		    class="i-medium mn-r-thin t-main" 
		    xmlns="http://www.w3.org/2000/svg" 
		    width="19" 
		    height="19" 
		    viewBox="0 0 19 19" 
		    fill="none"
		  >
		    <path 
		      d="M9.21484 18.4367C8.19857 18.4367 7.23014 18.2795 6.30957 17.965C5.389 17.6551 4.54362 17.2176 3.77344 16.6525C3.00781 16.092 2.34245 15.4266 1.77734 14.6564C1.2168 13.8863 0.779297 13.0432 0.464844 12.1271C0.154948 11.2066 0 10.2381 0 9.22186C0 8.20103 0.154948 7.23033 0.464844 6.30975C0.779297 5.38918 1.2168 4.54608 1.77734 3.78046C2.34245 3.01483 3.00781 2.34947 3.77344 1.78436C4.54362 1.21926 5.389 0.781759 6.30957 0.471863C7.23014 0.15741 8.19857 0.000183105 9.21484 0.000183105C10.2357 0.000183105 11.2064 0.15741 12.127 0.471863C13.0475 0.781759 13.8906 1.21926 14.6562 1.78436C15.4219 2.34947 16.0872 3.01483 16.6523 3.78046C17.2174 4.54608 17.6549 5.38918 17.9648 6.30975C18.2793 7.23033 18.4365 8.20103 18.4365 9.22186C18.4365 10.2381 18.2793 11.2066 17.9648 12.1271C17.6549 13.0432 17.2174 13.8863 16.6523 14.6564C16.0872 15.4266 15.4219 16.092 14.6562 16.6525C13.8906 17.2176 13.0475 17.6551 12.127 17.965C11.2064 18.2795 10.2357 18.4367 9.21484 18.4367ZM9.22168 10.6027C9.7959 10.6027 10.0967 10.3042 10.124 9.70721L10.2607 5.69452C10.2744 5.39374 10.181 5.14992 9.98047 4.96307C9.78451 4.77167 9.5293 4.67596 9.21484 4.67596C8.89583 4.67596 8.63835 4.76939 8.44238 4.95624C8.25098 5.14309 8.16211 5.38918 8.17578 5.69452L8.30566 9.71405C8.33301 10.3065 8.63835 10.6027 9.22168 10.6027ZM9.22168 13.6994C9.5498 13.6994 9.82324 13.6037 10.042 13.4123C10.2653 13.2163 10.377 12.9634 10.377 12.6535C10.377 12.3391 10.2653 12.0838 10.042 11.8879C9.82324 11.6919 9.5498 11.5939 9.22168 11.5939C8.89811 11.5939 8.6224 11.6942 8.39453 11.8947C8.17122 12.0907 8.05957 12.3436 8.05957 12.6535C8.05957 12.9634 8.17122 13.2163 8.39453 13.4123C8.6224 13.6037 8.89811 13.6994 9.22168 13.6994Z" 
		      :fill="hasOverdue ? '#FF0000' : '#007AFF'"
		    />
		  </svg>	
		  <span 
		  	class="p-medium t-semi"
		  	:class="[
			    hasOverdue ? 't-red' : 't-second'
			  ]"
		  >
				Need to return part of the equipment
			</span>
		</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import Tooltip from '@martyrs/src/components/Tooltip/Tooltip.vue'

import IconStatusCreated from '@martyrs/src/modules/orders/components/icons/IconStatusCreated.vue';
import IconStatusConfirmed from '@martyrs/src/modules/orders/components/icons/IconStatusConfirmed.vue';
import IconStatusInUse from '@martyrs/src/modules/orders/components/icons/IconStatusInUse.vue';
import IconStatusFinished from '@martyrs/src/modules/orders/components/icons/IconStatusFinished.vue';
import IconStatusCanceled from '@martyrs/src/modules/orders/components/icons/IconStatusCanceled.vue';
import IconStatusDelay from '@martyrs/src/modules/orders/components/icons/IconStatusDelay.vue';

const props = defineProps({
  orderId: String,
  status: String,
  positions: Array,
  createdAt: [String, Date],
  updatedAt: [String, Date],
  total: [String, Number]
});

const iconMap = {
  'created': IconStatusCreated,
  'confirmed': IconStatusConfirmed,
  'preparing': IconStatusInUse,
  'inuse': IconStatusInUse,
  'finished': IconStatusFinished,
  'canceled': IconStatusCanceled,
  'delay': IconStatusDelay
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

const statusText = computed(() => {
  const createdDate = formatDate(props.createdAt);
  const updatedDate = formatDate(props.updatedAt);
  
  switch(props.status.toLowerCase()) {
    case 'created':
      return `Created, ${createdDate}`;
    case 'confirmed':
      return `Confirmed, ${updatedDate}`;
    case 'preparing':
    case 'inuse':
      if (props.positions?.length) {
        const lastEndDate = new Date(props.positions[props.positions.length - 1].date.end);
        return `up to ${formatDate(lastEndDate)}`;
      }
      return `up to 18:00, ${updatedDate}`;
    case 'finished':
      return `Finished, ${updatedDate}`;
    case 'canceled':
      return `Canceled, ${updatedDate}`;
    default:
    // Расчет задержки
    if (props.positions?.length) {
      const lastPosition = props.positions[props.positions.length - 1];
      const lastEndDateRaw = lastPosition?.date?.end;

      if (lastEndDateRaw) {
        const lastEndDate = new Date(lastEndDateRaw);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastEndDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && props.status !== 'finished' && props.status !== 'canceled') {
          return `Delay ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }
      }
    }
    return `Created, ${createdDate}`;

  }
});

// Выбор иконки
const statusIcon = computed(() => {
  if (props.status === 'preparing' || props.status === 'inuse') {
    // Проверка на задержку
    if (props.positions?.length) {
      const lastEndDate = new Date(props.positions[props.positions.length - 1].date.end);
      if (new Date() > lastEndDate && props.status !== 'finished' && props.status !== 'canceled') {
        return IconStatusDelay;
      }
    }
    return IconStatusInUse;
  }
  return iconMap[props.status.toLowerCase()] || IconStatusCreated;
});

// Функция для нормализации даты (убираем время)
const getDateWithoutTime = (dateString) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Текущая дата и дата через 3 дня
const today = getDateWithoutTime(new Date());
const threeDaysFromNow = new Date(today);
threeDaysFromNow.setDate(today.getDate() + 3);

// Показывать ли уведомление о возврате
const showReturnNotice = computed(() => {
  return props.positions.some(position => {
    const endDate = position?.date?.end ? getDateWithoutTime(position.date.end) : null;
    return endDate !== null && endDate <= threeDaysFromNow;
  });
});

// Есть ли просроченные позиции
const hasOverdue = computed(() => {
  return props.positions.some(position => {
    const endDate = position?.date?.end ? getDateWithoutTime(position.date.end) : null;
    return endDate !== null && endDate < today;
  });
});

// Предполагается, что formatPrice определен где-то в коде
</script>

<style scoped>
/* Добавляем стиль для текста "просрочено" */
.t-red {
  color: red;
}
</style>