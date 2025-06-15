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

    <Tab
      v-model:selected="tab"
      :tabs="[
        { name: 'All', value: 'all' },
        { name: 'Active', value: 'active' },
        { name: 'Completed', value: 'completed' },
        { name: 'Canceled', value: 'canceled' }
      ]"
      class="mn-b-small o-hidden h5 radius-big bg-light"
    />

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
        :items="items"
        :startDate="calendarStartDate"
        :endDate="calendarEndDate"
        startDateKey="startDate"
        endDateKey="endDate"
        titleKey="title"
        statusKey="status"
        idKey="_id"
        class="mn-b-small"
        @item-click="viewRentDetails"
        @load-more="loadMoreData"
      >
      </GanttChart>

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
import Tab from '@martyrs/src/components/Tab/Tab.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

import CardRent from '@martyrs/src/modules/rents/views/components/blocks/CardRent.vue';
import GanttChart from '@martyrs/src/modules/rents/views/components/pages/GanttChart.vue';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import * as rents from '@martyrs/src/modules/rents/views/store/rents.store';

const route = useRoute();
const router = useRouter();

const tab = ref(route?.query ? route.query.tab : 'all');
const isCalendarView = ref(true);

// Set initial date range - current month plus 15 days before and 45 days after
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