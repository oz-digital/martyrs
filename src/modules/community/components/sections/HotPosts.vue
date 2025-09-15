<template>
  <Carousel
    :store="{
      read: (options) => blog.read({ 
        skip: props.skip, 
        limit: props.limit,
        user: props.userId,
        period: props.period,
        category: props.category 
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
  </Carousel>
</template>

<script setup>
import { defineProps } from 'vue'
import Carousel from '@martyrs/src/components/Feed/Carousel.vue'
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
.slider-hotpost :deep(.carousel__slide ) {
  flex: 0 0 25%;
}

@media screen and (max-width: 1025px) {
  .slider-hotpost :deep(.carousel__slide ) {
    flex: 0 0 75%;
  }
}
</style>