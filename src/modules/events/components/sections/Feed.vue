<template>
  <section class="feed">
    <TransitionGroup tag="ul" name="scaleTransition" class="o-hidden bg-light radius-big">
      <Loader v-if="isLoading"/>
    </TransitionGroup>

    <transition 
      name="scaleTransition"
    >
      <EmptyState 
        v-if="!isLoading && eventsList.length < 1"
        title="No Events Found"
        description="Currently, there are no events available. Please check back later."
        class="pd-medium mn-b-thin bg-light radius-big"
      />
    </transition>


    <TransitionGroup tag="ul" name="scaleTransition" class="container">
      <CardEvent 
        v-if="!isLoading && eventsList.length > 0"
        @click="$router.push({name: 'Event', params: {url: event.url}})" 
        v-for="(event,index) in eventsList" 
        :key="event._id" 
        :event="event" 
        :user="user" 
        :type="'normal'"
        class="bg-light radius-big mn-b-medium"
      />

      <button v-if="hasMoreEvents && eventsList.length > 0" @click="loadMoreEvents" class="w-100 bg-main button">Load more</button> 
      
    </TransitionGroup>  
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  
  import Loader from '@martyrs/src/components/Loader/Loader.vue';
  import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';
  
  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';
  import SkeletonEvent from '@martyrs/src/modules/icons/skeletons/SkeletonEvent.vue'

  import * as events from '@martyrs/src/modules/events/store/events.js';

  const props = defineProps({
    category: {
      type: String,
      default: null
    },
    selectedDate: {
      type: String,
      default: null
    },
    organization: {
      type: String,
      default: null
    },
    owner: {
      type: String,
      default: null
    },
    creator: {
      type: String,
      default: null
    },
    user: {
      type: [String, Number],
      default: null
    },
    sortOrder: {
      type: String,
      default: 'desc'
    },
    sortParam: {
      type: String,
      default: 'date.start'
    },
    participant: {
      type: String,
      default: null
    },
    period: {
      type: String,
      default: null
    },
    phase: {
      type: String,
      default: null
    }
  });

  const eventsList = ref([]);
  const hasMoreEvents = ref(false);
  const isLoading = ref(true);

  const skip = ref(0);
  const limit = ref(20);

  const loadMoreEvents = async () => {
    if (hasMoreEvents.value) {
      skip.value += limit.value;
      
      const data = await events.read({
        skip: skip.value,
        limit: limit.value,
        category: props.category,
        sortOrder: props.sortOrder,
        sortParam: props.sortParam,
        participant: props.participant,
        creator: props.creator,
        user: props.user,
        date: props.selectedDate,
        owner: props.owner,
        organization: props.organization,
        period: props.period,
        phase: props.phase
      });

      if (data.length === 0) {
        hasMoreEvents.value = false;
      } else {
        hasMoreEvents.value = true;
      }

      eventsList.value = [...eventsList.value, ...data];
    }
  };

  onMounted(async () => {
    isLoading.value = true;
    console.log(props.selectedDate)

    const data = await events.read({
      skip: skip.value,
      limit: limit.value,
      category: props.category,
      participant: props.participant,
      sortOrder: props.sortOrder,
      sortParam: props.sortParam,
      user: props.user,
      owner: props.owner,
      creator: props.creator,
      date: props.selectedDate,
      organization: props.organization,
      period: props.period,
      phase: props.phase
    });

    if (data.length === 0) {
      hasMoreEvents.value = false;
    } else {
      hasMoreEvents.value = true;
    }

    eventsList.value = data;
    isLoading.value = false;
  });
</script>

<style lang="scss">

</style>
