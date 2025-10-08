<template>
  <div class="bg-white radius-small pd-small flex-nowrap flex-v-center flex gap-thin">
    <!-- Thumbnail image -->
    <div v-if="showThumbnail" class="aspect-1x1 h-3r flex-child-default radius-small o-hidden">
      <img
        v-if="image && image.length > 0"
        :src="(FILE_SERVER_URL || '') + image"
        alt="Item image"
        class="w-100 h-100 object-fit-cover"
      />
      <PlaceholderImage v-else class="w-100 h-100" />
    </div>
    
    <!-- Item details -->
    <div class="mn-micro-negative flex flex-column w-100 o-hidden">
      <p class="w-100 pd-micro t-trim trimmed capitalize t-medium">{{ name || 'Unnamed Product' }}</p>
      
      <div class="flex pd-micro flex-v-center gap-micro w-max ">
      	<span v-if="title" :class="title_class" class="t-second  d-inline-block t-demi">{{title}}</span>
      	<span v-if="subtitle" class="t-transp p-small d-inline-block t-medium">{{ subtitle }}</span>
      </div>
    	<slot></slot>
    </div>
    <!-- <p>
     

      <span class="p-small t-transp">
        <template v-if="product.quantity">{{returnCurrency() }}{{product.price}} </template>
        × 
        <template v-if="product.listing === 'rent' && rentDates.start && rentDates.end">
          {{ rentalDays }} days
        </template>
        
        <template v-else>
          {{ product.quantity || 0 }} {{ product.unit || 'pcs' }}
        </template>
      </span>
    </p>  -->
    
    <!-- Actions -->
    <div class="flex gap-thin">
      <template v-for="(action, index) in actions" :key="index">
        <div 
          :class="action.class || 'bg-light'"
          class="radius-small pd-small flex-center flex aspect-1x1 cursor-pointer hover-scale-1"
          @click="() => action.handler(item, index)"
        >
          <component
            :is="action.component"
            class="i-medium"
          />
        </div>
      </template>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue';
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

const { formatPrice } = useGlobalMixins();

const props = defineProps({
	image: {
    type: String,
  },
  name: {
    type: String,
  },
  title: {
    type: String,
  },
  title_class: {
  	type: Array
  },
  subtitle: {
    type: String,
  },
  showThumbnail: {
    type: Boolean,
    default: true
  },
  actions: {
    type: Array,
    default: () => []
    // Expected format:
    // [
    //   {
    //     component: IconEdit,
    //     handler: (item, index) => {},
    //     class: 'bg-light' // optional custom class
    //   }
    // ]
  }
});
</script>