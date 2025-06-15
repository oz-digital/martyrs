<template>
  <div :class="$attrs.class" class="flex-nowrap flex"> 
    <!-- ////////////////////////// -->
    <!-- Label -->
    <!-- ////////////////////////// -->
    <div v-if="label" class="t-transp mn-r-small">
      <span>{{label}}</span>
    </div>
    <!-- ////////////////////////// -->
    <!-- Input -->
    <!-- ////////////////////////// -->
    <input
      ref="addressInput"
      class="w-100"
      :placeholder="placeholder"
      :value="address"
      @input="onInput"
    />
  <!-- ////////////////////////// -->
  <!-- Validation -->
  <!-- ////////////////////////// -->
    <transition mode="out-in" name="fade">
      <div v-if="validation" class="mn-t-thin invalid-feedback">
        * {{validation.message}}
      </div>
    </transition>
  </div>
</template>

<style>
.pac-container {
  position: absolute;
  background-color: white;
  z-index: 1000;
  border-radius: 2rem;
  overflow: hidden;
}
</style>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';

import { Loader as GMLoader } from "@googlemaps/js-api-loader";

const props = defineProps({
  apiKey: {
    type: String,
    required: true,
  },
  label: null,
  placeholder: 'Enter something here',
  field: null,
  location: {
    type: Object,
    default:  { lat: 48.6900735, lng: 41.16202390 }
  },
  address: {
    type: String,
    default: ""
  },
  locale: {
    type: String,
    default: 'en'
  }
});

const emit = defineEmits(['update:address', 'update:location', 'update:country', 'update:state', 'update:city']);

const addressInput = ref(null);

let autocomplete;

const onPlaceChanged = () => {
  const place = autocomplete.getPlace();

  if (!place.geometry || !place.address_components) {
    return;
  }

  let country = '', state = '', city = '';

  for (let i = 0; i < place.address_components.length; i++) {

    let addr = place.address_components[i];

    if (addr.types.includes('country')) {
      country = addr.long_name;
    }
    if (addr.types.includes('administrative_area_level_1')) {
      state = addr.long_name;
    }
    if (addr.types.includes('locality')) {
      city = addr.long_name;
    }
  }
  
  const newAddress = place.formatted_address;
  const newLocation = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };

  emit('update:address', newAddress);
  emit('update:location', newLocation);
  
  // Add new emits
  emit('update:country', country);
  emit('update:state', state);
  emit('update:city', city);
};

onMounted(() => {  
  const loader = new GMLoader({  
    apiKey: props.apiKey,  
    version: "weekly",  
    libraries: ["places"],
    language: props.locale,    
  });

  loader.load().then(() => {  
    autocomplete = new google.maps.places.Autocomplete(addressInput.value);  
    autocomplete.addListener('place_changed', onPlaceChanged);  
  }).catch(e => {  
    console.error(e);  
  });  
});
</script>