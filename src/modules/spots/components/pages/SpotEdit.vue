<template>
  <div v-if="spots.state.spot" class="for-transition w-100 cols-1 pd-thin gap-thin">


    <Block class="flex-nowrap flex-v-center flex">
      
      <h1 class="mn-r-auto">
        {{ route.params.spot ? spots.state.spot.profile.name : 'Create Spot' }}
      </h1>

      <Button 
        :submit="onSubmit" 
        :callback="redirectTo"
        class="bg-main"
      >
        Save Spot
      </Button>
    </Block>
    

    <div class="cols-2 gap-thin"> 
      <Block
        title="Profile"
        class="mn-b-semi"
      >
        <div class="gap-small mn-b-small cols-2-fit-content">
          <UploadImage 
             v-model:photo="spots.state.spot.profile.photo"
            :uploadPath="'organizations/' + spots.state.spot.name + '/avatars'"
            class="aspect-1x1 w-8r o-hidden radius-extra" 
          />

          <div class="w-100">
            <Field 
              v-model:field="spots.state.spot.profile.name"     
              label="Name"  
              placeholder="Spot Name" 
              class="mn-b-small bg-white radius-small pd-medium"
              :validation="organizationName" 
            />
            <Field 
              v-model:field="spots.state.spot.profile.description"     
              label="Description"  
              placeholder="Spot description (max 120 symbols)" 
              class="bg-white radius-small pd-medium"
              :validation="organizationName" 
            />  
          </div>
        </div>

        <Field 
          v-model:field="spots.state.spot.minorder"     
          label="Min.order"  
          placeholder="Enter minimum order value" 
          class="bg-white radius-small mn-b-small pd-small"
          :validation="organizationName" 
        />  

        <Select 
          v-model:select="spots.state.spot.status"
          label="Status"
          :options="[
            'unpublished', 
            'published',
            'archivied'
          ]"
          placeholder="Status"
          class="pos-relative w-100 mn-b-small bg-white radius-small pd-medium"
        />

        <p class="p-regular mn-b-small">Please the available delivery options:</p>

        <Checkbox 
          v-for="option in ['pickup','courier','post']"
          :label="option"
          name="Delivery"
          :value="option"
          class="w-100 mn-b-small bg-white radius-small pd-small"
          :radio="spots.state.spot.delivery"
          @update:radio="event => spots.state.spot.delivery = event"
        />

        <p class="p-regular mn-b-small">Please select the available payment methods:</p>
     
        <Checkbox 
          v-for="option in ['cash','bank transfer','crypto']"
          :label="option"
          name="Payment"
          :value="option"
          class="w-100 mn-b-small bg-white radius-small pd-small"
          :radio="spots.state.spot.payment"
          @update:radio="event => spots.state.spot.payment = event"
        />
      </Block>

      <Block
        title="Location"
        class="pos-relative"
      >
        <Address
          :apiKey="GOOGLE_MAPS_API_KEY" 
          :address="spots.state.spot.address" 
          :location="spots.state.spot.location"  
          :locale="$i18n.locale"   
          label="Address"    
          placeholder="Enter delivery address"  
          class="
            bg-white pd-small radius-tl-medium radius-tr-medium 
          "
          @update:location="newLocation => {
            spots.state.spot.location = newLocation;
          }"
          @update:address="newAddress => {
            spots.state.spot.address = newAddress;
          }"
        />
        <LocationMarker 
         :apiKey="GOOGLE_MAPS_API_KEY" 

          :address="spots.state.spot.address" 
          :location="spots.state.spot.location" 
          :locale="$i18n.locale"
          
          class="h-20r mn-b-small radius-bl-medium radius-br-medium  o-hidden"
          @update:location="newLocation => {
            spots.state.spot.location = newLocation;
          }"
          @update:address="newAddress => {
            spots.state.spot.address = newAddress;
          }"
        />
        <WorktimeEdit 
          v-model:worktime="spots.state.spot.worktime"
          class="mn-b-small"
        />

        <p class="mn-b-small p-regular">Options:</p>
        <Checkbox 
          :label="'Hide address'"
          name="address"
          class="w-100 mn-r-small bg-white radius-small pd-small"
          :radio="spots.state.spot.position?.hide"
          @update:radio="event => spots.state.spot.position.hide = event"
        />

      </Block>

    </div>

    <Button :submit="onDelete" :callback="redirectDash" class="w-100 bg-light">Delete Spot</Button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import Block from '@martyrs/src/components/Block/Block.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';

import Tab from "@martyrs/src/components/Tab/Tab.vue";
import Field from "@martyrs/src/components/Field/Field.vue";
import Select from "@martyrs/src/components/Select/Select.vue";
import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue";
import Address from "@martyrs/src/components/Address/Address.vue";
import LocationMarker from "@martyrs/src/components/LocationMarker/LocationMarker.vue";
import Button from "@martyrs/src/components/Button/Button.vue";
import Popup from "@martyrs/src/components/Popup/Popup.vue";

import WorktimeEdit from "../sections/WorktimeEdit.vue";

import * as spots from "@martyrs/src/modules/spots/store/spots.js";

const router = useRouter();
const route = useRoute();
const tabOrganization = ref("details");
const showAddNew = ref(false);

const getRouteName = (baseName) => `${route.meta?.context || ''}${baseName}`

onMounted(async () => {
  await fetchData();
})

async function fetchData() {

  if (route.params.spot) await spots.actions.readOne(route.params.spot);

  const lng = spots.state.spot.location?.coordinates[0]
  const lat = spots.state.spot.location?.coordinates[1]

  spots.state.spot.location = {
    lat: lat || 1,
    lng: lng || 1
  }
}

async function onSubmit() {

  spots.state.spot.location = {
    type: 'Point',
    coordinates: [spots.state.spot.location.lng, spots.state.spot.location.lat]
  }


  if (route.params.spot) {
    await spots.actions.update(
      route.params._id,
      spots.state.spot
    );
  }
  if (!route.params.spot) {
    await spots.actions.create(
      route.params._id,
      spots.state.spot
    );
  }
}

function redirectTo() {
  router.push({ name: getRouteName('Spots'), params: { _id: route.params._id } });
}

async function onDelete() {
  await spots.actions.delete(
    route.params._id,
    spots.state.spot
  );
}

function redirectDash() {
  router.push({ name: getRouteName('Spots'), params: { _id: route.params._id } });
}
</script>

<style scoped>
</style>