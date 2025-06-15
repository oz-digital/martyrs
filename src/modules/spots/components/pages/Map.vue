<template>
  <div class="h-100 w-100 pos-relative">
    <div class="w-100 pos-absolute  z-index-2 pos-b-10 ">
      <Button 
        :submit="searchInCurrentLocation"  
        class="mn-l-auto mn-r-auto  bg-black t-white w-min-20 button"
      >
        Search in This Location
      </Button>
    </div>

    <div id="map" class="h-100 w-100 pos-relative o-hidden">
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import { Loader as GMLoader } from "@googlemaps/js-api-loader";

import Button from '@martyrs/src/components/Button/Button.vue'

import { state, actions } from '@martyrs/src/modules/organizations/store/organizations.js'

import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as marketplace from '@martyrs/src/modules/marketplace/views/store/marketplace.js';

const router = useRouter();
const route = useRoute();

const props = defineProps({
  localPosition: Object,
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

let map = ref(null);
let markers = ref([]);

let skip = ref(0);
let limit = ref(50);

let currentMapCenter = ref({lat: 0, lng: 0});
let currentMapZoom = ref(null);

async function getCountry() {
  try {
    const response = await fetch('https://ip2c.org/s');
    const result = await response.text();

    if (!result || result[0] !== '1') {
      throw new Error('Unable to fetch the country');
    }

    // Разделение строки и извлечение кода страны
    const parts = result.split(';');
    if (parts.length < 4) {
      throw new Error('Invalid response format');
    }

    console.log(parts[3])

    return parts[3]; // Возвращает двухбуквенный код страны
  } catch (error) {
    console.error(error);
    throw error;
  }
}


onMounted(async () => {
  let lat = parseFloat(route.query.lat || globals.state.position?.location?.lat);
  let lng = parseFloat(route.query.lng || globals.state.position?.location?.lng);

  let zoomLevel;

  // Определите уровень зума в зависимости от доступной информации
  if (route.params.location || globals.state.position?.location) {
    zoomLevel = 15;
  } else if (route.params.country || globals.state.position?.country) {
    zoomLevel = 9;
  } else if (route.params.state || globals.state.position?.state) {
    zoomLevel = 6;
  } else if (route.params.city || globals.state.position?.city) {
    zoomLevel = 14;
  } else {
    zoomLevel = 2;
  }

  const loader = new GMLoader({
    apiKey: props.apiKey,
    version: "weekly",
    libraries: ["places"],
    language: 'en'
  });

  loader.load().then(async () => {

    // Если координаты не заданы, попробуйте их получить
    if (!lat || !lng) {
      let country

      const geocoder = new google.maps.Geocoder();

      try {
        country = await getCountry();
      } catch {
        country = 'Thailand' 
        console.log(error)
      }

      try {
        const results = await geocoder.geocode({ 'address': country })

        console.log(results);

        if (results) {
          lat = results.results[0].geometry.location.lat();
          lng = results.results[0].geometry.location.lng();
          zoomLevel = 6;
        } else {
          console.error('No results found for the country code.');
        }
      } catch (error) {
        console.error('Error getting coordinates from country code:', error);
      }
    }
    
    // If there's no lat/lng in the query, try to use country/state/city to get the lat/lng
    if (!lat && !lng && (route.params.country || route.params.state || route.params.city)) {
      const geocoder = new google.maps.Geocoder();

      const address = [
        route.params.city,
        route.params.state,
        route.params.country
      ].filter(Boolean).join(', ');

      try {
        const results = await geocoder.geocode({ address });

        if (results[0]) {
          lat = results[0].geometry.location.lat();
          lng = results[0].geometry.location.lng();
        }

      } catch (error) {
        console.error('Error getting coordinates:', error);
      }
    }


    skip.value += limit.value;

    const params = {
      // country: route.params.country,
      // state: route.params.state,
      // city: route.params.city,
      // categories: route.query.categories,
      // prices: route.query.prices,
      // delivery: route.query.delivery,
      country: route.params.country,
      state: route.params.state,
      city: route.params.city,
      categories: route.query.categories,
      prices: route.query.prices,
      delivery: route.query.delivery,
      sortParam: route.query.sortParam || marketplace.state.sort.param,
      sortOrder: route.query.sortOrder || marketplace.state.sort.order,
      location: {coordinates: [lng,lat] },
      locationRadius: 1000,
      limit: 500,
    };

    console.log(params)

    const data = await actions.read(params);

    state.all = [...state.all, ...data];

    map.value = new google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false,
      fullscreenControl: false,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#212121"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#212121"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#757575"
            },
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "administrative.neighborhood",
          "stylers": [
            // {
            //   "visibility": "off"
            // }
          ]
        },
        {
          "featureType": "poi",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#181818"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1b1b1b"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#2c2c2c"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8a8a8a"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#373737"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels",
          "stylers": [
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#3c3c3c"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#4e4e4e"
            }
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#000000"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3d3d3d"
            }
          ]
        }
      ],
      center: { lat, lng },
      zoom: parseInt(route.query.zoom || zoomLevel || '12')
    });

   

      for (let marker of markers.value) {
        marker.setMap(null);
      }

      markers.value = [];

      // Add new markers
      markers.value = data.map(org => {
        // Get the first spot's location
        let location = org.spots[0]?.location;

        if (location && location.type === 'Point') {
          let [lng, lat] = location.coordinates; // Note that coordinates are in [lng, lat] format
          
          let markerIcon = '/marker_2.png'; // Default marker icon

          if (org.products && org.products.length === 0) {
            markerIcon = '/marker.png'; // If there are no products, set a different icon
          }
          
          const marker = new google.maps.Marker({
            position: { lng, lat },
            map: map.value,
            icon: {
              url: markerIcon, // URL to the icon
              scaledSize: new google.maps.Size(32, 48), // icon dimensions
              origin: new google.maps.Point(0,0), // coordinate origin for this icon
              anchor: new google.maps.Point(16, 48) // point on the icon that corresponds to the geographic location of the marker
            }
          });

          // Add click listener to the marker
          marker.addListener('click', () => {
            router.push({name: 'Organization', params: {_id: org._id}});
          });

          return marker;
      }
      return null;
    }).filter(marker => marker !== null); // Remove null markers

    google.maps.event.addListener(map.value, 'center_changed', () => {
      let center = map.value.getCenter();
      currentMapCenter.value = {
        lat: center.lat(),
        lng: center.lng()
      };
    });

    google.maps.event.addListener(map.value, 'zoom_changed', () => {
      currentMapZoom.value = map.value.getZoom();
    });

  })

});

const searchInCurrentLocation = async () => {
  // Use currentMapCenter for the location
  const params = {
    country: route.params.country,
    state: route.params.state,
    city: route.params.city,
    categories: route.query.categories,
    prices: route.query.prices,
    delivery: route.query.delivery,
    sortParam: route.query.sortParam || marketplace.state.sort.param,
    sortOrder: route.query.sortOrder || marketplace.state.sort.order,
    locationRadius: 8000/currentMapZoom.value,
    limit: 100,
    location: {
      type: "Point",
      coordinates: [currentMapCenter.value.lng, currentMapCenter.value.lat]
    }
  };

  console.log([currentMapCenter.value.lng, currentMapCenter.value.lat])

  try {
    const data = await actions.read(params);
    // Remove old markers
    for (let marker of markers.value) {
      marker.setMap(null);
    }
    markers.value = [];

    // Add new markers
    markers.value = data.map(org => {
      let location = org.spots[0]?.location;
      if (location && location.type === 'Point') {
        let [lng, lat] = location.coordinates; // Note that coordinates are in [lng, lat] format
        let markerIcon = org.products && org.products.length > 0 ? '/marker_2.png' : '/marker.png';

        const marker = new google.maps.Marker({
          position: { lng, lat },
          map: map.value,
          icon: {
            url: markerIcon, // URL to the icon
            scaledSize: new google.maps.Size(32, 48), // icon dimensions
            origin: new google.maps.Point(0,0), // coordinate origin for this icon
            anchor: new google.maps.Point(16, 48) // point on the icon that corresponds to the geographic location of the marker
          }
        });

        // Add click listener to the marker
        marker.addListener('click', () => {
          router.push({ name: 'Organization', params: { _id: org._id } });
        });

        return marker;
      }
      return null;
    }).filter(marker => marker !== null); // Remove null markers
  } catch (error) {
    console.error('Error fetching organizations:', error);
  }
};



</script>

<style scoped lang="scss">
  #map {
    &:focus {
      outline: none;
    }
  }
</style>
