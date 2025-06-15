<template>
  <section class="w-100 mn-b-semi radius-medium pd-medium bg-second t-black">
    <div class="mn-b-thin flex-v-center flex-nowrap flex">    
      <h4>
        {{text}}
      </h4>

      <h4 class="mn-l-thin uppercase radius-big t-semi t-medium t-white bg-black w-max pd-thin">
        {{ percentage || completionPercentage }}%
      </h4>

      <router-link
        v-if="cta"
        :to="{
          name: 'User Edit Profile',
          params: { _id: user }
        }"
        class="mn-l-auto uppercase radius-big t-semi t-medium t-white bg-black w-max pd-thin"
      >
        {{text_cta}}
      </router-link>
    </div> 

    <div class=" w-100 h-2r pos-relative pd-nano bg-black radius-big">
      <div :style="`width: ${completionPercentage}%`"class="h-100 bg-second mn-b-thin radius-big">
      </div>
    </div>
   
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { user, cta, target} = defineProps({
  user: Object,
  target: Object,
  cta: Boolean,
  percentage: Number,
  text: String,
  text_cta: String,
})

const completionPercentage = ref(0)

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


if (target) completionPercentage.value = calculateCompletion(target)
</script>

<style scoped>
</style>