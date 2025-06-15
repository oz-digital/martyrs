<template>
  <Slider
    :store="{
      read: (options) => blog.read({ 
        skip, 
        limit,
        user: userId,
        period,
        category 
      })
    }"
    :text="{
      messages: {
        en: {
          title: 'No Blogposts Found',
          description: 'Currently, there are no blogposts available.'
        }
      }
    }"
    v-slot="{ 
      item
    }"
    class="slider-hotpost flex-child-default"
  >
    <CardBlogpost 
      :key="item._id" 
      :blogpost="item" 
      :user="auth.state.user._id" 
      :hideDescription="true"
      class="bg-white flex flex-column radius-medium h-35r"
    />
  </Slider>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Slider from '@martyrs/src/components/Slider/Slider.native.vue'
import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue'
import * as blog from '@martyrs/src/modules/community/store/blogposts.js'
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
  },
  category: {
    type: String,
    default: 'featured'
  }
})
</script>

<style lang="scss">
.slider-hotpost .carousel__slide {
  flex: 0 0 25%;
}
@media screen and (max-width: 1025px) {
  .slider-hotpost .carousel__slide {
    flex: 0 0 75%;
  }
}
</style>