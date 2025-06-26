<template>
  <Carousel
    :store="{
      read: products.actions.read
    }"
    :options="{ 
      limit: 10 
    }"
    :text="{ title: 'No products available' }"
    :showDots="true"
  >
    <template #default="{ item }">
      <router-link  
        :to="{ name: 'Organization_Product', params: { _id: item.owner.target, product: item._id } }"
        class="h-100 pos-relative block"
      >
        <CardProduct  
          :product="item"
          class="h-max-40r h-100 bg-light"
        />
      </router-link>
    </template>
  </Carousel>
</template>

<script setup>
import Carousel from '@martyrs/src/components/Feed/Carousel.vue'
import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

import * as products from '@martyrs/src/modules/products/store/products.js'
</script>

<style lang="scss">
.carousel__slide {
  flex: 0 0 25%;
  min-width: 0;
}
@media screen and (max-width: 1025px) {
  .carousel__slide {
    flex: 0 0 75%;
    min-width: 0;
  }
}
</style>