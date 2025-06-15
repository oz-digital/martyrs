<template>
  <SliderNative
    :store="{
      read: (options) => events.read({ 
        skip, 
        limit,
        status 
      })
    }"
    :text="{
      en: {
        title: 'No Featured Events Found',
        description: 'Currently, there are no featured events available.'
      }
    }"
    v-slot="{ 
      item
    }"
    class="slider-hotpost flex-child-default"
  >

    <router-link 
      :to="{name: 'Event', params: {url: item.url}}" 
      class="cursor-pointer pos-relative flex flex-justify-end flex-column h-25r bg-semi radius-medium o-hidden pd-medium t-white bg-dark"
    >
      <Media 
        :url="(FILE_SERVER_URL || '') + item.cover"
        class="pos-absolute pos-t-0 pos-r-0 z-index-1 w-100 h-100 object-fit-cover bg-light"
      />

      <div class="pos-relative z-index-2">
        <h3 
          class="mn-b-small"
        >
          {{ item.name }}
        </h3>
        <span v-if="item.date?.start" class="mn-r-nano d-inline-block w-max pd-b-micro pd-t-micro pd-r-thin pd-l-thin radius-small t-medium bg-white">
          <span class="t-semi t-black" > 
            {{item.location}} / {{formatDate(item.date.start, { language: $i18n.locale, monthName: true,  })}} 
          </span>
        </span> 
      </div>
    </router-link>

  </SliderNative>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'

import Feed from '@martyrs/src/components/Feed/Feed.vue'
import SliderNative from '@martyrs/src/components/Slider/Slider.native.vue'
import Media from '@martyrs/src/components/Media/Media.vue'

import * as events from '@martyrs/src/modules/events/store/events.js'; 
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

const props = defineProps({
  skip: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number,
    default: 8
  },
  userId: {
    type: String,
    default: () => auth.state.user._id
  },
  period: {
    type: String,
    default: 'year'
  },
  status: {
    type: String,
    default: 'featured'
  }
})
</script>

<style lang="scss">
.slider-hotpost .embla__slide {
  flex: 0 0 75%;
}
@media screen and (max-width: 1025px) {
  .slider-hotpost .embla__slide {
    flex: 0 0 75%;
  }
}
</style>