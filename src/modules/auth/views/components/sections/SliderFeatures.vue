<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Slider from '@martyrs/src/components/Slider/Slider.vue'

const { tm } = useI18n({
  useScope: 'global'
})
const features = computed(() => tm('auth.features'))
</script>

<template>
  <Slider :showDots="true" :slideCount="features.length" class="auth_slider h-100">
    <div class="grid o-hidden h-100 carousel__slide" style="  grid-template-rows: 1fr auto;" v-for="(feature, index) in features" :key="index">
      <div class="h-100 background-div" :style="`background-image: url(/features/${index}.png);`"></div>
      <div class="h-100 pd-big">
        <h5 class="t-center w-100 mn-b-regular">{{ feature.title }}</h5>
        <p class='t-center t-transp w-100'>{{ feature.description }}</p>
      </div>
    </div>
  </Slider>
</template>

<style lang="scss">
.auth_slider .carousel {
  height: 100%;
}

.auth_slider .carousel__container {
  height: 100%;
}

.parent-div {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.background-div {
  background-size:cover; 
  background-position: center center; 
  background-repeat: no-repeat;
}

.background-div {
  flex-grow: 1; // Занимает все оставшееся пространство
}
</style>