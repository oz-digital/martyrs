<template>
  <Block title="Delivery">
    <h5 class="font-second mn-b-thin">Select delivery type</h5>
    
    <div class="mn-b-small flex-nowrap flex" v-if="availableDeliveryTypes.length">
      <Radio 
        v-for="type in availableDeliveryTypes"
        :key="type"
        v-model:radio="order.delivery.type"
        :label="capitalize(type)"
        :value="type"
        class="bg-white field-wrapper cursor-pointer pd-medium radius-small w-100 mn-r-small"
      />
    </div>
    <div v-else>No delivery options available.</div>

    <!-- Раздел для Pickup -->
    <template v-if="order.delivery.type === 'pickup'">
      <h5 class="font-second mn-b-thin">Select pickup spot</h5>
      <CardSpot
        v-for="(spot, index) in organization?.spots.filter(item => item.delivery?.includes('pickup'))"
        :key="index"
        :spot="spot"
        :organization="order.organization"
        :editAcess="false"
        :showDeliveryOptions="false"
        :showPaymentOptions="false"
        :selected="order.delivery.spot === spot._id"
        @click="() => order.delivery.spot = order.delivery.spot === spot._id ? null : spot._id"
        class="field-wrapper cursor-pointer mn-b-thin radius-medium o-hidden bg-white"
      />
    </template>

    <!-- Раздел для Courier -->
    <template v-else-if="order.delivery.type === 'courier' || order.delivery.type === 'post'">
      <h5 class="font-second mn-b-thin">Address</h5>
      <Address
        label="Location"    
        :apiKey="GOOGLE_MAPS_API_KEY" 
        :address="order.delivery.address" 
        :location="order.delivery.location"  
        placeholder="Enter your address"  
        class="bg-white radius-tl-medium radius-tr-medium t-black pd-medium"
        @update:location="newLocation => { order.delivery.location = newLocation; }"
        @update:address="newAddress => { order.delivery.address = newAddress; }"
      />
      <!-- Карта доставки -->
      <LocationMarker 
        :apiKey="GOOGLE_MAPS_API_KEY" 
        :address="order.delivery.address" 
        :location="order.delivery.location"
        class="mn-b-thin radius-bl-medium radius-br-medium h-15r o-hidden"
        @update:location="newLocation => { 
          if (order.delivery.type === 'courier') order.delivery.location = newLocation;
        }"
        @update:address="newAddress => { 
          if (order.delivery.type === 'courier') order.delivery.address = newAddress;
        }"
      />
    </template>
    <!-- Комментарии -->
    <Field 
      v-model:field="order.comment"     
      placeholder="Comments regarding the address (apartment unit, floor level, building section)"
      type="textarea"  
      class="bg-white pd-medium radius-small"
    />
  </Block>
</template>

<script setup>
import { watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Feed from '@martyrs/src/components/Feed/Feed.vue';
import CardSpot from '@martyrs/src/modules/spots/components/blocks/CardSpot.vue';
import * as spotsModule from '@martyrs/src/modules/spots/store/spots.js';
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
import Block from '@martyrs/src/components/Block/Block.vue';
import Address from '@martyrs/src/components/Address/Address.vue';
import LocationMarker from '@martyrs/src/components/LocationMarker/LocationMarker.vue';
import Radio from '@martyrs/src/components/Radio/Radio.vue';
import Field from '@martyrs/src/components/Field/Field.vue';

const store = useStore()

const props = defineProps({
  order: Object,
  organization: Object,
});

const route = useRoute();

// Сбрасываем spot при переключении типа доставки
watch(() => props.order.delivery.type, (newType) => {
  if (newType !== 'pickup') {
    props.order.delivery.spot = null;
  }
});

// Устанавливаем начальные данные из store при монтировании
onMounted(() => {
  if (store.core.state.position) {
    props.order.delivery.address = store.core.state.position.address;
    props.order.delivery.location = store.core.state.position.location;
  }
});

const availableDeliveryTypes = computed(() => {
  const types = new Set()
  props.organization?.spots?.forEach(spot => {
    spot.delivery?.forEach(type => types.add(type))
  })
  return Array.from(types)
})

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

</script>