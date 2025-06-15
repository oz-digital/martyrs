<template>
  <section class="">
    <div class="mn-b-small gap-small flex-v-center flex-nowrap flex">
      <h4 class="t-nowrap  ">
        {{ text }}

      <span class="uppercase radius-big t-nowrap t-medium t-white bg-black w-max pd-micro pd-l-thin pd-r-small">
        {{ percentage || completionPercentage }}%
      </span>

      </h4>

      <router-link 
        v-if="cta"
        class="h4 mn-l-auto"
         :to="{
          name: 'User Edit Profile',
          params: { _id: user }
        }"
      >

        <span class="uppercase radius-big t-nowrap t-medium t-white bg-black w-max pd-micro pd-l-thin pd-r-small">
          {{ text_cta }}
        </span>
      
      </router-link>
    </div> 

    <div class="w-100 h-2r pos-relative pd-nano bg-black radius-big">
      <div :style="`width: ${completionPercentage}%`" class="h-100 bg-second mn-b-thin radius-big">
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const { user, cta, target } = defineProps({
  user: Object,
  target: Object,
  cta: Boolean,
  percentage: Number,
  text: String,
  text_cta: String,
});

const calculateCompletion = (profileObject) => {
  let totalProperties = 0;
  let filledProperties = 0;

  function recurse(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          recurse(obj[key]);  // Recurse into nested objects
        } else {
          totalProperties++;
          if (obj[key] != null && obj[key] !== '') {
            filledProperties++;
          }
        }
      }
    }
  }

  recurse(profileObject);

  return (totalProperties === 0 ? 0 : Math.round((filledProperties / totalProperties) * 100));
};

const completionPercentage = computed(() => {
  return target ? calculateCompletion(target) : 0;
});
</script>
