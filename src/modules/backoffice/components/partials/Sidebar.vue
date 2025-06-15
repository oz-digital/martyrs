<template>
  <div class="pos-relative o-y-scroll o-x-hidden h-100">
    <div class="br-b  h3 h-4r pd-semi br-solid br-black-transp-10">Backoffice</div>
    <div class="pd-semi">
      <span class="pd-thin uppercase t-medium t-transp">Menu</span>
      <div 
        v-for="item in menuItems" 
        :key="item.name"
        @click="router.push({ name: item.routeName })" 
        class="flex pd-thin flex-v-center cursor-pointer">
        <component 
          v-if="item.icon" 
          :is="item.icon" 
          class="i-regular mn-r-thin" 
          :icon="true" 
          :fill="'rgba(var(--black),0.25)'"
        /> 
        <span class="t-medium">{{ item.title }}</span>
      </div>
      
      <span class="pd-thin d-block mn-t-medium uppercase t-medium t-transp">General</span>
      <div 
        v-for="item in generalItems" 
        :key="item.name"
        @click="router.push({ name: item.routeName })" 
        class="flex pd-thin flex-v-center cursor-pointer">
        <component 
          v-if="item.icon" 
          :is="item.icon" 
          class="i-regular mn-r-thin" 
          :icon="true" 
          :fill="'rgba(var(--black),0.25)'"
        /> 
        <span class="t-medium">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup="props">
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
import { ref, onMounted } from 'vue';

// Mobile Module
import SelectMulti from '@martyrs/src/components/SelectMulti/SelectMulti.vue'

import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue'
import IconPayments from '@martyrs/src/modules/icons/entities/IconPayments.vue'
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue'
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue'
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue'
import IconGallery from '@martyrs/src/modules/icons/entities/IconGallery.vue'
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue'
import IconLeftovers from '@martyrs/src/modules/icons/entities/IconLeftovers.vue'
/////////////////////////////
// HELPERS
/////////////////////////////
import { useRoute, useRouter } from 'vue-router'

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js'

const route = useRoute()
const router = useRouter()
/////////////////////////////
// CREATED
/////////////////////////////
const props = defineProps({
  favorites: Array,
});

const selectedOrganization = ref(null);
const publics = ref([]);

// Define menu items
const menuItems = [
  {
    name: 'organizations',
    title: 'Organizations',
    routeName: 'Backoffice Organizations',
    icon: IconGroups
  },
  {
    name: 'community',
    title: 'Community',
    routeName: 'Backoffice Community',
    icon: IconCommunity
  },
  {
    name: 'products',
    title: 'Products',
    routeName: 'Products',
    icon: IconProducts
  },
  {
    name: 'leftovers',
    title: 'Leftovers',
    routeName: 'Leftovers',
    icon: IconLeftovers
  },
  {
    name: 'orders',
    title: 'Orders',
    routeName: 'BackofficeOrdersList',
    icon: IconOrders
  },
  {
    name: 'gallery',
    title: 'Gallery',
    routeName: 'Backoffice Gallery',
    icon: IconGallery
  },
  {
    name: 'events',
    title: 'Events',
    routeName: 'BackofficeEvents Backoffice',
    icon: IconEvents
  }
];

// Define general items
const generalItems = [
  {
    name: 'payments',
    title: 'Payments',
    routeName: 'Payments',
    icon: IconPayments
  },
  {
    name: 'users',
    title: 'Users',
    routeName: 'Users',
    icon: null
  },
  {
    name: 'pages',
    title: 'Pages',
    routeName: 'Backoffice Pages',
    icon: null
  },
  {
    name: 'reports',
    title: 'Reports',
    routeName: 'Backoffice Reports',
    icon: null
  }
];

/////////////////////////////
// MOUNTED
/////////////////////////////
onMounted(async () => {
});
</script>

<style lang="scss">
</style>