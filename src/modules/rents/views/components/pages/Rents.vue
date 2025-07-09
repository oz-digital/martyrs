<template>
  <div class="pd-medium mobile:pd-thin bg-white">
    <header class="mn-b-medium flex-v-center flex-nowrap flex">
      <h2 class="mn-r-medium">Rents</h2>
      <button 
        @click="$router.push({ name: 'Organization_Create Rent', params: {_id: route.params._id}})" 
        class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
      >
        +
      </button>
      <div class="mn-l-auto flex-v-center">
        <button 
          @click="toggleView" 
          class="pd-small radius-small bg-light mn-r-small"
        >
          {{ isCalendarView ? 'List View' : 'Calendar View' }}
        </button>
      </div>
    </header>

    <Feed
      :search="true"
      :states="{
        empty: {
          title: 'No Rents Found',
          description: 'Currently, there are no rents available.'
        }
      }"
      :store="{ read: (options) => rents.actions.read(options) }"
      :options="{
        limit: 15,
        owner: route.params._id,
        ...(tab !== 'all' && { status: tab })
      }"
      v-slot="{ items }"
    > 
      <GanttChart
        v-model:view="view"
        v-model:date="date"
        v-model:dateRange="dateRange"
        :items="sampleData"
        :loading="loading"
        @load-more="handleLoadMore"
        @item-click="handleItemClick"
        @today="handleToday"
      />
      {{items}}

     <!--  <CardRent
        v-else
        v-for="rent in items"
        :key="rent._id"
        :rent="rent"
        class="bg-light pd-small mn-b-thin radius-small"
      /> -->
    </Feed>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

import Tab from '@martyrs/src/components/Tab/Tab.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

import CardRent from '@martyrs/src/modules/rents/views/components/blocks/CardRent.vue';

import GanttChart from '@martyrs/src/modules/rents/views/components/pages/Gant/GanttChart.vue';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import * as rents from '@martyrs/src/modules/rents/views/store/rents.store';

const route = useRoute();
const router = useRouter();

const isCalendarView = ref(true);

// Sample data
const sampleData = ref([
  {
    id: 2,
    title: 'Product A',
    startDate: dayjs().add(1, 'days').toDate(),
    endDate: dayjs().add(5, 'days').toDate(),
    status: 'active'
  },
  {
    id: 3,
    title: 'Product B',
    startDate: dayjs().subtract(1, 'days').toDate(),
    endDate: dayjs().add(2, 'days').toDate(),
    status: 'completed'
  },
  {
    id: 4,
    title: 'Product C',
    startDate: dayjs().toDate(),
    endDate: dayjs().add(4, 'days').toDate(),
    status: 'canceled'
  },
  // Additional test data for hour view
  {
    id: 5,
    title: 'Product D',
    startDate: dayjs().add(2, 'days').add(8, 'hours').toDate(),
    endDate: dayjs().add(2, 'days').add(16, 'hours').toDate(),
    status: 'active'
  },
  {
    id: 6,
    title: 'Product E',
    startDate: dayjs().add(1, 'days').add(14, 'hours').toDate(),
    endDate: dayjs().add(2, 'days').add(10, 'hours').toDate(),
    status: 'completed'
  }
])

// Set initial date range - current month plus 15 days before and 45 days after
const view = ref('days')
const date = ref(new Date())
const loading = ref(false)

const dateRange = computed(() => {
  const d = dayjs(date.value)
  
  switch (view.value) {
    case 'hours':
      return {
        start: d.subtract(1, 'days').startOf('day').toDate(),
        end: d.add(6, 'days').endOf('day').toDate()
      }
      
    case 'days':
      return {
        start: d.startOf('month').toDate(),
        end: d.endOf('month').toDate()
      }
      
    case 'weeks':
      return {
        start: d.subtract(1, 'month').startOf('week').toDate(),
        end: d.add(2, 'months').endOf('week').toDate()
      }
      
    default:
      return {
        start: d.startOf('month').toDate(),
        end: d.endOf('month').toDate()
      }
  }
})

// Handle load more
const handleLoadMore = async (direction) => {
  console.log('Loading more:', direction)
  
  loading.value = true
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Add more items if needed
      loading.value = false
      resolve()
    }, 1000)
  })
}

// Handle item click
const handleItemClick = (item) => {
  console.log('Item clicked:', item)
}

// Handle today
const handleToday = () => {
  date.value = new Date()
}

const today = new Date();
const calendarStartDate = ref(new Date(today));
calendarStartDate.value.setDate(today.getDate() - 30);

const calendarEndDate = ref(new Date(today));
calendarEndDate.value.setDate(today.getDate() + 30);

// Toggle between calendar and list view
const toggleView = () => {
  isCalendarView.value = !isCalendarView.value;
};

// Navigate to rent details page
const viewRentDetails = (rent) => {
  router.push({ name: 'Rent Details', params: { _id: rent._id } });
};

// Load more data when scrolling the Gantt chart
const loadMoreData = async ({ direction, date }) => {
  // alert(direction)
  console.log('scroll direction is', direction)
  console.log('current date is', date)
  // Update the visible range
  if (direction === 'forward') {
    calendarEndDate.value = date;
  } else {
    calendarStartDate.value = date;
  }
  // Here you can add logic to fetch more rents if they fall within the new date range
  try {
    // You might need to adjust this depending on your API and data structure
    const startDateParam = new Date(calendarStartDate.value);
    startDateParam.setDate(startDateParam.getDate() - 30); // Fetch a bit more to cover edge cases
    
    const endDateParam = new Date(calendarEndDate.value);
    endDateParam.setDate(endDateParam.getDate() + 30);
    
    await rents.actions.read({
      owner: route.params._id,
      startDate: startDateParam.toISOString(),
      endDate: endDateParam.toISOString(),
      ...(tab.value !== 'all' && { status: tab.value })
    });
  } catch (error) {
    console.error('Error loading additional rent data:', error);
  }
};
</script>

<style lang="scss">
</style>
