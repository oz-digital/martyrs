<template>
	<div class="t-center flex-center">
		<p class="h1 mn-b-medium">🌍</p>
		
		<h3 class="mn-b-semi">{{t('title')}}</h3>
		<p class="mn-b-small t-transp p-medium">{{t('description')}}</p> 
		
		<Address
			:key="$i18n.locale"
      :apiKey="GOOGLE_MAPS_API_KEY" 

      :locale="$i18n.locale"
      
      :address="position.address" 
      :location="position.location"  
      
      placeholder="Enter your address"  

      class="
        bg-white radius-tl-medium radius-tr-medium  t-black br-grey-transp-25 br-solid br-2px pd-medium
      "

      @update:country="newCountry => {
        position.country = newCountry;
      }"
		  @update:state="newState => {
        position.state = newState;
      }"
		  @update:city="newCity => {
        position.city = newCity;
      }"
      @update:location="newLocation => {
        position.location = newLocation;
      }"
      @update:address="newAddress => {
        position.address = newAddress;
      }"
    />

    <LocationMarker 
    	:key="$i18n.locale"
      :apiKey="GOOGLE_MAPS_API_KEY" 
      :locale="$i18n.locale"


      :address="position.address" 
      :location="position.location" 

      class="bg-light radius-bl-medium radius-br-medium h-15r o-hidden"

      @update:country="newCountry => {
        position.country = newCountry;
      }"
		  @update:state="newState => {
        position.state = newState;
      }"
		  @update:city="newCity => {
        position.city = newCity;
      }"
      @update:location="newLocation => {
        position.location = newLocation;
      }"
      @update:address="newAddress => {
        position.address = newAddress;
      }"
    />
		
		<button @click="savePosition()" class="w-100 mn-t-medium bg-main radius-extra button">Save Position</button>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
// Import components
import Address from "@martyrs/src/components/Address/Address.vue";
import LocationMarker from "@martyrs/src/components/LocationMarker/LocationMarker.vue";
// Import libs
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'

// Accessing router and store
const route = useRoute()
const router = useRouter()

const position = ref({
	country: null,
  state: null,
  city: null,
  address: null,
  location: null,
})

function savePosition() {
	globals.state.position = { ...position.value };
	globals.state.isOpenLocationPopup = false

	localStorage.setItem('position', JSON.stringify(globals.state.position));
}

onMounted(() => {
	position.value = { ...globals.state.position }
})

// Localization
const text = {
  messages: {
    en: {
	    title: "Choose Your Location",
	    description: "Enter your address or select it on the map to see the nearest offers to you.",
    },
    ru: {
		  title: "Выбор Локации",
	    description: "Пожалуйста, выберите вашу страну из списка ниже, чтобы увидеть варианты доставки и другую актуальную информацию:"
	  }
	}
}
const { t } = useI18n(text)
</script>

<style lang="scss">
</style>
