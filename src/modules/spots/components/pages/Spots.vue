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

    <div class="w-100 rows-1 pd-thin pos-relative o-hidden">
        
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
            search: route.query.search
          }"
          v-slot="{ 
            items 
          }"
          class="cols-1 pos-relative w-100 rows-1 gap-thin"
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

    </div>
  </div>
</template>

<script setup="props">
  // Import libs
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  // Import components
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardSpot from '@martyrs/src/modules/spots/components/blocks/CardSpot.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'

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

  // Categories for mobile view
  const currentCategories = ref([]);

  const selectCategory = (category) => {
    // Implementation for category selection
    console.log('Category selected:', category);
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