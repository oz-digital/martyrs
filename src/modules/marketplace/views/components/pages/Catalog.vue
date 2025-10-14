<template>
	<Feed
		v-model:sort="marketplace.state.sort"
		v-model:filter="marketplace.state.filter"
    :search="true"
    :showLoadMore="false"
    :states="{
      empty: {
        title: 'No Shops Found',
        description: 'Currently, there are no shops.'
      },
    }"
    :store="{
      read: (options) => organization.actions.read(options)
    }"
    :options="{
      country: route.params.country,
	    state: route.params.state,
	    city: route.params.city,
	    categories: route.query.categories,
	    prices: route.query.prices,
	    delivery: route.query.delivery,
	    location: core.state.position?.location,
	    lookup: ['products','spots'],
	    contain: ['products'],
    }"
    v-slot="{ 
      items 
    }"
    class="rows-1 gap-thin"
  >
    <CardOrganization 
	    v-for="organization in items" 
	    :key="organization._id"
	    :organization="organization"
	    :showRating="true"
	    :showFollowers="false"
	    :showProducts="true"
	    class="bg-light w-100 o-hidden radius-medium pd-small "
	  />
  </Feed>
</template>

<script setup>
	import { computed,reactive,ref, onMounted,watch  } from 'vue'
	import { useRoute } from 'vue-router'

	import Feed from '@martyrs/src/components/Feed/Feed.vue'
	
	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'
	import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
	const core = useStore()

	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

	import * as marketplace from '../../store/marketplace';
	
	const route = useRoute()

	onMounted(() => {
		// Добавление Google Analytics event на открытие маркетплейса
		if (typeof gtag === 'function') {
			gtag('event', 'view_marketplace', {
				location: core.state.position?.location || 'unknown',
				page_path: window.location.pathname,
				marketplace_id: route.params.id || 'main',
			});
		}
	})
</script>

<style lang="scss">
</style>
