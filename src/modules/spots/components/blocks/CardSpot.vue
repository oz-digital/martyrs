<template>
  <div class="pos-relative pd-small rows-1">


    <div class="w-100 flex-nowrap flex gap-thin">
      <div
        class="aspect-1x1 h-100"
      >
        <Map 
          :apiKey="GOOGLE_MAPS_API_KEY" 
          :location="{
            lat: spot.location.coordinates[1],
            lng: spot.location.coordinates[0]
          }" 
          :locale="$i18n.locale"
          class="radius-small o-hidden"
       
        />
      </div>
      <div>

        <!-- Edit Button -->
        <router-link
          v-if="editAccess"
          :to="{
          name: 'Spot Edit',
          params: {
            _id: props.organization._id || props.organization,
            spot: spot._id
          }
        }"
          class="
            z-index-2
            cursor-pointer 
            pos-absolute pos-t-regular pos-r-regular
            radius-extra pd-thin bg-second
          "
        >
          <IconEdit
            class="i-regular"
            classes="fill-white"
          />
        </router-link>

        <IconCheckmark
          v-if="selected"
          :fill="'rgb(var(--white))'"
          class="z-index-2 pos-absolute pos-t-regular pos-r-regular radius-extra bg-second pd-thin i-semi"
        />
     
        <p
          class="mn-b-thin p-medium t-medium d-inline-block w-100"
          v-html="spot.profile.name"
        />
        
        <p v-if="spot.profile.description" class="d-block p-big mn-b-thin">
          {{spot.profile.description}}
        </p>

        <div class="bg-light pd-thin radius-thin">
          <p class="text-box-trim-end  p-small w-100 t-truncate">
            {{spot.address}}
          </p>
        </div>

        <p class="uppercase t-medium mn-t-small mn-b-thin" v-if="showDeliveryOptions">Delivery</p>
        <Chips 
          v-if="showDeliveryOptions && spot.delivery.length > 0" 
          :chips="spot.delivery"
        />

        <p class="uppercase t-medium  mn-t-small mn-b-thin"  v-if="showPaymentOptions">Accepted Payment</p>
        <Chips 
          v-if="showPaymentOptions && spot.payment.length > 0" 
          :chips="spot.payment"
        />
      </div>


    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue';

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';

import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';


import Chips  from '@martyrs/src/components/Chips/Chips.vue';
import Map      from '@martyrs/src/components/Map/Map.vue';

const props = defineProps({
  spot: Object,
  organization: Object,
  editAccess: Boolean,
  showDeliveryOptions: Boolean,
  showPaymentOptions: Boolean,
  selected: Boolean
});
</script>
<style scoped>
.subspotsartment {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}
</style>