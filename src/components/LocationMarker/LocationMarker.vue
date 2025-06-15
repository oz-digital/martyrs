<template>
  <div class="pos-relative">
    <div ref="mapContainer" class="w-100 h-100"></div>

    <button class="cursor-pointer flex-center flex pos-absolute pos-t-regular pos-r-regular i-semi bg-second pd-nano radius-extra" @click="setUserLocation">

      <transition name="ScaleOut" mode="out-in"> 
        <svg v-if="!locationLoading" class="i-regular" width="98" height="98" viewBox="0 0 98 98" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50.0004 31.4995C39.7996 31.4995 31.5 39.7991 31.5 49.9999C31.5 60.2007 39.7996 68.5003 50.0004 68.5003C60.2012 68.5003 68.5008 60.2007 68.5008 49.9999C68.5008 39.7991 60.2012 31.4995 50.0004 31.4995ZM50.0004 63.7944C42.3941 63.7944 36.2059 57.6062 36.2059 49.9999C36.2059 42.3936 42.3941 36.2054 50.0004 36.2054C57.6067 36.2054 63.7949 42.3936 63.7949 49.9999C63.7949 57.6062 57.6067 63.7944 50.0004 63.7944Z" fill="rgb(var(--white))"/>
          <path d="M97.6471 47.6471H84.56C83.3977 30.4141 69.5859 16.6024 52.3529 15.44V2.35294C52.3529 1.05255 51.2988 0 50 0C48.6996 0 47.6471 1.05255 47.6471 2.35294V15.44C30.4141 16.6024 16.6024 30.4141 15.44 47.6471H2.35294C1.05255 47.6471 0 48.6996 0 50C0 51.2988 1.05255 52.3529 2.35294 52.3529H15.44C16.6024 69.5859 30.4141 83.3977 47.6471 84.56V97.6471C47.6471 98.9459 48.6996 100 50 100C51.2988 100 52.3529 98.9459 52.3529 97.6471V84.56C69.5859 83.3977 83.3977 69.5859 84.56 52.3529H97.6471C98.9459 52.3529 100 51.2988 100 50C100 48.6996 98.9459 47.6471 97.6471 47.6471ZM50 79.9435C33.4886 79.9435 20.0565 66.5114 20.0565 50C20.0565 33.4886 33.4886 20.0565 50 20.0565C66.5098 20.0565 79.9435 33.4886 79.9435 50C79.9435 66.5098 66.5098 79.9435 50 79.9435Z" fill="rgb(var(--white))"/>      
        </svg>

        <Loader v-else  class="pos-t-0 pos-l-0 i-small"/>
      </transition>

    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { Loader as GMLoader } from "@googlemaps/js-api-loader";

import Loader from '@martyrs/src/components/Loader/Loader.vue'

// Добавим новый проп для ключа API
const props = defineProps({
  location: {
    type: Object,
    default: () => ({ lat: 15.8700, lng: 100.9925 })
  },
  address: {
    type: String,
    default: null
  },
  apiKey: String,
  locale: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['update:location', 'update:address', 'update:country', 'update:state', 'update:city']);

const mapContainer = ref(null);
const locationLoading = ref(false);

let map, marker;

onMounted(() => {
  const loader = new GMLoader({
    apiKey: props.apiKey,
    version: "weekly",
    libraries: ["places"],
    language: props.locale,    
  });

  loader.load().then(() => {
    map = new google.maps.Map(mapContainer.value, {
      center: props.location,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      disableDefaultUI: true
    });

    marker = new google.maps.Marker({
      position: props.location,
      map,
      draggable: true,
    });

    marker.addListener("dragend", (e) => {
      const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      emit('update:location', newLocation);

      getAddressFromLocation(newLocation);
    });
  }).catch(e => {
    console.error(e);
  });
});

watchEffect(() => {
  if (props.location && marker) {
    marker.setPosition(new google.maps.LatLng(props.location.lat, props.location.lng));
  }
});

watchEffect(() => {
  if (props.location && map) {
    const newCenter = new google.maps.LatLng(props.location.lat, props.location.lng);
    
    map.setCenter(newCenter);
    map.setZoom(15);
  }
});

function getAddressFromLocation(location) {
  
  const geocoder = new google.maps.Geocoder;

  geocoder.geocode({ 'location': location }, (results, status) => {
    if (status === 'OK') {
      if (results[0]) {
        emit('update:address', results[0].formatted_address);

        let country = '', state = '', city = '';

        results[0].address_components.forEach((addr) => {
          if (addr.types.includes('country')) {
            country = addr.long_name;
          }
          if (addr.types.includes('administrative_area_level_1')) {
            state = addr.long_name;
          }
          if (addr.types.includes('locality')) {
            city = addr.long_name;
          }
        });

        emit('update:country', country);
        emit('update:state', state);
        emit('update:city', city);
      } else {
        console.error('No results found');
      }
    } else {
      console.error('Geocoder failed due to: ' + status);
    }
  });
}

// Функция для установки местоположения пользователя
async function setUserLocation() {
  locationLoading.value = true
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      emit('update:location', newLocation);
      getAddressFromLocation(newLocation);
      locationLoading.value = false
    }, () => {
      console.error('Error getting location');
      locationLoading.value = false
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
    locationLoading.value = false
  }
}
</script>


<style >
.my-location-button {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 99;
}

.gm-style-cc { display:none; }


</style>
