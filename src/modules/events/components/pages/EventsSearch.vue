<template>
  <section class="pd-big mobile:pd-thin bg-white"> 
    <h3 class="mn-b-small">
      {{ pageTitle }}
    </h3>
    <Feed
      :search="true"
      :showLoadMore="false"
      :states="{
        empty: {
          title: 'No Events',
          description: 'Currently, there are no events available.'
        }
      }"
      :store="{
        read: (options) => events.read(options),
        state: events.state
      }"
      :options="feedOptions"
      v-slot="{ items }"
      class="cols-1 gap-thin"
    >
      <CardEvent 
        @click="$router.push({name: 'Event', params: {url: event.url}})" 
        v-for="(event,index) in items" 
        :key="event._id" 
        :event="event" 
        :user="auth.state.user._id" 
        :type="'normal'"
        class="bg-light radius-big"
      >
      </CardEvent>
    </Feed>
  </section>
</template>

<script setup="props">
  import { computed, onMounted, watch, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import DatePicker from '@martyrs/src/components/DatePicker/DatePicker.vue' 
  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';
  // Import state
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as events from '@martyrs/src/modules/events/store/events.js'; 

  import { useI18n } from 'vue-i18n';

  // State
  const route = useRoute();
  const router = useRouter();
  const { locale, t } = useI18n();

  // Generate feed options based on route query parameters
  const feedOptions = computed(() => {
    const options = {
      user: auth.state.user._id,
      limit: 9
    };
    
    if (route.query.periodStart) {
      options.periodStart = route.query.periodStart;
    }
    
    if (route.query.periodEnd) {
      options.periodEnd = route.query.periodEnd;
    }

    return options;
  });

  // Format date for display in title
  const formatDate = (dateString, format = 'long') => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return new Intl.DateTimeFormat(locale.value, 
        format === 'long' ? 
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } : 
          { year: 'numeric', month: 'short', day: 'numeric' }
      ).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Generate page title based on query parameters
 const pageTitle = computed(() => {
  const startDate = route.query.periodStart;
  const endDate = route.query.periodEnd;
  
  if (startDate && endDate) {
    // Check if the dates represent a single day by comparing just the date parts
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Compare only the date portions (year, month, day)
    const isSameDay = start.getFullYear() === end.getFullYear() &&
                     start.getMonth() === end.getMonth() &&
                     start.getDate() === end.getDate();
    
    if (isSameDay) {
      return `Events on ${formatDate(startDate)}`;
    }
    
    // Otherwise it's a date range
    return `Events from ${formatDate(startDate, 'short')} to ${formatDate(endDate, 'short')}`;
  }
  
  // Fallback case
  return 'All Events';
});
</script>

<style lang="scss">
  
</style>