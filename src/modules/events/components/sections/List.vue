<template>
  <section 
    class="today-events"
  >
    <!-- <transition name="fade">
      <Loader v-if="isLoading" class="z-index-5 pos-t-50 left-t-50 pos-absolute"/>
    </transition> -->

    <TransitionGroup tag="ul" name="fade" class="o-hidden bg-white radius-medium">
      <SkeletonEventShort
        v-if="isLoading"
        v-for="i in limit" :key="i"
      />
    </TransitionGroup>

    <transition 
      name="fade"
    >
      <EmptyState 
        v-if="!isLoading && eventsList.length < 1"
        title="No Planned Events "
        description="No events available. Please check back later."
        class="pd-medium h-100 bg-white radius-medium"
      />
    </transition>


    <TransitionGroup tag="ul" name="fade" class="container">
      <CardEvent 
        v-if="!isLoading && eventsList.length > 0"
        @click="$router.push({name: 'Event', params: {url: event.url}})" 
        v-for="(event,index) in eventsList" 
        :key="event._id" 
        :event="event" 
        :owner="user" 
        :type="'short'"
        class="pd-medium mobile:pd-thin"
        :class="{
          'br-b br-solid br-black-transp-10': index !== eventsList.length - 1
        }"
      />
    </TransitionGroup>
    
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  

  import Loader from '@martyrs/src/components/Loader/Loader.vue';
  import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';

  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';

  import SkeletonEvent from '@martyrs/src/modules/icons/skeletons/SkeletonEvent.vue'
  import SkeletonEventShort from '@martyrs/src/modules/icons/skeletons/SkeletonEventShort.vue'

  import * as events from '@martyrs/src/modules/events/store/events.js';

  const props = defineProps({
    category: {
      type: String,
      default: null
    },
    status: {
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
    user: {
      type: [String, Number],
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
  const isLoading = ref(true);

  const skip = ref(0);
  const limit = ref(3);

  onMounted(async () => {
    const data = await events.read({
      skip: skip.value,
      limit: limit.value,
      sortOrder: 'desc',
      category: props.category,
      user: props.user,
      owner: props.owner,
      organization: props.organization,
      period: props.period,
      phase: props.phase,
      status: props.status
    });

    eventsList.value = data;
    isLoading.value = false;
  });
</script>

<style lang="scss">
</style>
