<template>
  <div class="gap-thin flex-nowrap flex flex-center">
    <div v-if="isTimeOver" class="flex-child-grow-1  flex-child-shrink-0 flex-child-basis-auto pd-medium bg-blur-small bg-white-transp-5 radius-small">
      <p class="p-small t-transp">Offer is over</p>
    </div>

    <div  v-if="!isTimeOver" class="flex-child-grow-1  flex-child-shrink-0 flex-child-basis-auto pd-thin bg-blur-small bg-white-transp-5 radius-small">
    	<p class="p-semi">{{ days }}</p>
    	<p class="p-small t-transp">Days</p>
    </div>
     <div  v-if="!isTimeOver" class="flex-child-grow-1  flex-child-shrink-0 flex-child-basis-auto pd-thin bg-blur-small bg-white-transp-5 radius-small">
    	<p class="p-semi">{{ hours }}</p>
    	<p class="p-small t-transp">hours</p>
    </div>
     <div  v-if="!isTimeOver" class="flex-child-grow-1  flex-child-shrink-0 flex-child-basis-auto pd-thin bg-blur-small bg-white-transp-5 radius-small">
    	<p class="p-semi">{{ minutes }}</p>
    	<p class="p-small t-transp">minutes</p>
    </div>
     <div  v-if="!isTimeOver" class="flex-child-grow-1  flex-child-shrink-0 flex-child-basis-auto pd-thin bg-blur-small bg-white-transp-5 radius-small">
    	<p class="p-semi">{{ seconds }}</p>
    	<p class="p-small t-transp">seconds</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps([
  'date',
])

const targetDate = new Date(props.date).getTime();
const currentDate = ref(new Date().getTime());

let interval;

const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const isTimeOver = ref(false);

const calculateTime = () => {
  const timeDifference = targetDate - currentDate.value;

  if (timeDifference <= 0) {
    // Target date has passed, set all values to 0
    days.value = 0;
    hours.value = 0;
    minutes.value = 0;
    seconds.value = 0;
    isTimeOver.value = true
    clearInterval(interval);
  } else {
    days.value = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    hours.value = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes.value = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    seconds.value = Math.floor((timeDifference % (1000 * 60)) / 1000);
  }
};

calculateTime();

onMounted(() => {
  interval = setInterval(() => {
    currentDate.value = new Date().getTime();
    calculateTime();
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>
