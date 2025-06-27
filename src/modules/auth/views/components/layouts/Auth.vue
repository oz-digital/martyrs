<template>
  <div 
  	class="cols-2-1_2 gap-small pd-small"
  >
    <router-view
    	class="pd-big mobile:pd-medium w-m-66r t-center" 
    	v-slot="{ Component, route }"
    >
      <transition 
      	name="scaleIn" mode="out-in"
      >
        <component 
        	ref="page" 
        	:key="route.path" 
        	:localPosition="localPosition" 
        	:is="Component" 
        />
      </transition>
    </router-view>

    <section class="w-100 desktop-only o-hidden radius-big bg-black t-white">
      <SliderFeatures/>  
    </section>
  </div>
</template>

<script setup>
import SliderFeatures from '@martyrs/src/modules/auth/views/components/sections/SliderFeatures.vue'

import { useRoute } from 'vue-router'

const route = useRoute()
</script>