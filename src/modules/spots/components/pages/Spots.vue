<template>
  <div class="pos-relative">
    <header 
      v-if="route.name !== 'Organization' && !MOBILE_APP"
      class="pd-medium flex-v-center flex-nowrap flex"
    >
      <h2 class="mn-r-medium">Spots</h2>
      <button 
        v-if="hasAccess(route.params._id, 'spots', 'create', auth.state.accesses, auth.state.access.roles)"
        @click="$router.push({
          name: route.params?._id ? 'Organization_SpotAdd' : 'SpotAdd'
        })" 
        class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second">
          +
      </button>
    </header>

    <div class="cols-2-1_3 br-1px br-solid br-light z-index-3 pos-relative">

      <div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
        <div class="w-100 o-y-scroll h-100">
          <!-- Categories -->
          <div class="mn-b-medium" v-if="currentCategories.length > 0">
            <h4 class="mn-b-small">
              {{ route.params.categoryPath ? 'Subcategories' : 'Categories' }}
            </h4>
            <div class="gap-micro">
              <div
                v-for="category in currentCategories"
                :key="category._id"
                @click="selectCategory(category)"
                class="pd-small radius-small cursor-pointer hover-bg-light transition-all"
              >
                {{ category.name }}
              </div>
            </div>
          </div>

          <!-- Location Filter -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Location</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Field
                  v-model="searchLocation"
                  placeholder="Search location..."
                  type="text"
                  class="w-100 bg-light pd-small radius-small mn-b-small"
                />
                <Checkbox 
                  v-for="location in locationOptions"
                  :key="location"
                  v-model:radio="selectedLocation"
                  :label="location"
                  :value="location"
                  mode="radio"
                  class="mn-b-micro"
                />
              </div>
            </template>
          </Spoiler>

          <!-- Delivery Options -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Delivery Options</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Checkbox 
                  v-for="option in deliveryOptions"
                  :key="option.value"
                  v-model:checkbox="selectedDeliveryOptions"
                  :label="option.label"
                  :value="option.value"
                  mode="checkbox"
                  class="mn-b-micro"
                />
              </div>
            </template>
          </Spoiler>

          <!-- Payment Options -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Payment Options</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Checkbox 
                  v-for="option in paymentOptions"
                  :key="option.value"
                  v-model:checkbox="selectedPaymentOptions"
                  :label="option.label"
                  :value="option.value"
                  mode="checkbox"
                  class="mn-b-micro"
                />
              </div>
            </template>
          </Spoiler>

          <!-- Clear Filters Button -->
          <button 
            @click="clearFilters"
            class="bg-main w-100 button mn-t-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div class="w-100 rows-1 pd-thin pos-relative o-hidden">
        <Filters
          v-model:filters="availableFilters"
          v-model:selected="selectedFilters"
        />
        
        <div class="mn-b-thin w-100 o-y-scroll scroll-hide scroll-snap-type-x-mandatory scroll-pd-regular">
          <div class="gap-thin flex-nowrap flex">
            <div
              v-for="category in currentCategories"
              :key="category._id"
              @click="selectCategory(category)"
              class="flex-child-default bg-light flex t-nowrap pd-medium radius-medium cursor-pointer hover-bg-light transition-all"
            >
              {{ category.name }}
            </div>
          </div>
        </div>

        <Feed
          :search="true"
          v-model:filter="spots.state.filter"
          v-model:sort="spots.state.sort"
          :showLoadMore="false"
          :states="{
            empty: {
              title: 'No Spots Found',
              description: 'Currently, there are no spots available.'
            }
          }"
          :store="{
            read: (options) => spots.actions.read(options),
            state: spots.state
          }"
          :options="{
            limit: 12,
            organization: route.params._id || null,
            user: auth.state.user._id,
            location: selectedLocation,
            deliveryOptions: selectedDeliveryOptions,
            paymentOptions: selectedPaymentOptions,
            search: route.query.search
          }"
          v-slot="{ 
            items 
          }"
          class="cols-3 pos-relative w-100 rows-1 gap-thin"
        >
          <CardSpot
            v-for="(spot, index) in items"
            :key="index"
            :spot="spot"
            :organization="organization"
            :editAccess="hasAccess(route.params._id, 'spots', 'edit', auth.state.accesses, auth.state.access.roles)"
            :showDeliveryOptions="true"
            :showPaymentOptions="true"
            class="radius-medium h-min-big bg-light"
            @click="$router.push({ 
              name: route.params._id ? 'Organization_Spot' : 'Spot', 
              params: { 
                _id: route.params._id,
                spot: spot._id 
              } 
            })"
          />
        </Feed>

        <button
          v-if="hasAccess(route.params._id, 'spots', 'create', auth.state.accesses, auth.state.access.roles)"
          @click="$router.push(`/spots/${route.params._id}/spots/create`)"
          class="mn-t-medium bg-main button w-100"
        >
          Add New Spot
        </button>
      </div>
    </div>
  </div>
</template>

<script setup="props">
  // Import libs
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  // Import components
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import Filters from '@martyrs/src/modules/globals/views/components/sections/Filters.vue'
  import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"
  import Field from "@martyrs/src/components/Field/Field.vue"
  import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue"

  import CardSpot from '@martyrs/src/modules/spots/components/blocks/CardSpot.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'
  import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

  // Accessing router and store
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as spots from '@martyrs/src/modules/spots/store/spots.js';
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

  const route = useRoute()
  const router = useRouter()
  const { hasAccess } = useGlobalMixins()

  // Props
  const props = defineProps({
    organization: {
      type: Object,
      default: null
    }
  })

  // Categories
  const currentCategories = ref([]);
  const searchLocation = ref('');
  const selectedLocation = ref('All');
  const locationOptions = ref(['All', 'Phuket', 'Bangkok', 'Chiang Mai', 'Pattaya']);

  // Delivery options
  const deliveryOptions = ref([
    { label: 'Pickup', value: 'pickup' },
    { label: 'Delivery', value: 'delivery' },
    { label: 'Dine-in', value: 'dinein' }
  ]);
  const selectedDeliveryOptions = ref([]);

  // Payment options
  const paymentOptions = ref([
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'Crypto', value: 'crypto' },
    { label: 'Bank Transfer', value: 'transfer' }
  ]);
  const selectedPaymentOptions = ref([]);

  const availableFilters = ref([
    {
      title: 'Location',
      value: 'location',
      type: 'radio',
      options: locationOptions.value.map(loc => ({ label: loc, value: loc }))
    },
    {
      title: 'Type',
      value: 'type',
      type: 'checkbox',
      options: [
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Cafe', value: 'cafe' },
        { label: 'Bar', value: 'bar' },
        { label: 'Club', value: 'club' }
      ]
    }
  ])

  const selectedFilters = ref({
    location: 'All',
    type: []
  })

  const selectCategory = (category) => {
    // Implementation for category selection
    console.log('Category selected:', category);
  };

  const clearFilters = () => {
    selectedLocation.value = 'All';
    selectedDeliveryOptions.value = [];
    selectedPaymentOptions.value = [];
    searchLocation.value = '';
    selectedFilters.value = {
      location: 'All',
      type: []
    };
  };

  globals.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Organization_SpotAdd', params: { _id: route.params._id} }) : router.push({ name: 'SpotAdd' })
  }]

  onMounted(async () => {
    if (route.params._id) {
      await organizations.actions.read({ _id: route.params._id });
    }
  })

  onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });
</script>

<style lang="scss">
</style>