<template>
  <div ref="gmap" class="gmap"></div>
  
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';


import { Loader as GMLoader } from "@googlemaps/js-api-loader";

const props = defineProps({
  location: Object,
  apiKey: String,
  locale: String,
});

let gmap = ref(null);
let map = null;
let marker = null;

onMounted(async () => {
  const loader = new GMLoader({
    apiKey: props.apiKey,
    version: "weekly",
    libraries: ["places"],
    language: props.locale,    
  });

  loader.load().then(() => {
    map = new google.maps.Map(gmap.value, {
      zoom: 13,
      center: {
        lat: props.location.lat,
        lng: props.location.lng,
      },
    });

    // Добавить маркер
    marker = new google.maps.Marker({
      position: {
        lat: props.location.lat,
        lng: props.location.lng,
      },
      map: map,
    });
 }).catch(e => {
    console.error(e);
  });
});
watch(() => props.location, () => {
  if (map && marker) {
    // Обновить позицию маркера
    marker.setPosition(new google.maps.LatLng(props.location.lat, props.location.lng));

    // Обновить центр карты
    map.setCenter(new google.maps.LatLng(props.location.lat, props.location.lng));
  }
}, { deep: true });

</script>

<style scoped>
.gmap {
  height: 100%;
  width: 100%;
}
</style>
