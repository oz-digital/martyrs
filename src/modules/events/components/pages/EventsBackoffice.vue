<template>
	<div 
		class=""
	>
		<header 
			class="mn-b-medium pd-thin flex-v-center flex-nowrap flex"
		>
    	<h2
    		class="mn-r-medium"
    	>
    		Events
    	</h2>
    	
    	<button
    		v-if="auth.state.user._id === route.params.user || route.params._id"
    		@click="router.push({name: getRouteName('Create Event')})"
    		class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
    	>
    		+
    	</button>
		</header>

		<section class="pd-thin rows-1 bg-white">

			<Tab 
				v-if="auth.state.user._id === route.params.user"
				v-model:selected="tabEventOwner"
				:tabs="[
					{ name: 'Organizer', 	value: 'owner' },
					{ name: 'Participant', 	value: 'participant' },	
				]"
				class="
					mn-b-thin
					flex-child-default
					h-max
					o-hidden 
					h5 
					bg-white
					gap-micro pd-t-thin pd-b-thin
					br-b br-solid br-black-transp-10
				"
				classTab="bg-light pd-small radius-small w-100"
			/>

			<Feed
				:search="true"
				v-model:sort="sort"
	      :states="{
	        empty: {
	          title: 'No Events Found',
	          description: 'Currently, there are no events available.'
	        }
	      }"
	      :store="{
	        read: (options) => events.read(options),
	      }"
	      :options="{
	        user: auth.state.user._id,
	        owner: route.params._id,
	        creator: route.params.user,
	        sortParam: 'date.start',
	        sortOrder: 'desc'
	      }"
	      v-slot="{ 
	        items 
	      }"
	      class="cols-1 gap-thin"
	    >
	    	<!-- <Table 
						class="radius-semi bg-white"
						:items="items"
						:columns="[{ 
					    key: '_id', 
					    label: 'ID',
							formatter: (value) => `#${value.slice(0, 4)}...${value.slice(-4)}` 
					  },
					  { 
					    key: 'name', 
					    label: 'Name',
					    formatter: (value) => `${value}`
					  },
					  { 
					    key: 'tickets', 
					    label: 'Tickets',
					    formatter: (value) => value?.length || 0
					  },
					  {
					    key: 'status',
					    label: 'Status',
					    component: StatusBadge
					  },
					  {
					    key: 'date.start',
					    label: 'Date',
					    formatter: (value) => new Date(value).toLocaleDateString()
					  }]" 
					/> -->
	       <CardEvent
	        @click="router.push({name: getRouteName('Event'), params: {url: event.url}})"
	        v-for="(event,index) in items"
	        :key="event._id"
	        :event="event"
	        :user="auth.state.user._id"
	        :type="'normal'"
	        :actions="auth.state.user._id === event.creator.target._id || hasAccess(event.owner?.target?._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles)
	          ? [
	              { label: 'Edit Event', to: { name: getRouteName('Edit Event'), params: { url: event.url } } },
	              { label: 'Manage Tickets', to: { name: getRouteName('Edit Event Tickets'), params: { url: event.url } } }
	            ]
	          : []"
	        class="bg-light radius-medium"
	      />
	    </Feed>
	  </section>

   <!--  <Feed 
			v-if="tabEventOwner ==='owner'"
	  	:user="auth.state.user._id"
			:creator="route.params.user"
			:owner="route.params._id"
			:sortOrder="'asc'"
		/> -->


		<!-- <Feed 
			v-if="tabEventOwner ==='participant'"
  		:user="auth.state.user._id"
  		:participant="route.params.user"
  		:owner="route.params._id"
			:sortOrder="'desc'"
		/> -->
	</div>
</template>

<script setup>
	import { watch, ref, computed } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Components
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

import Table from '@martyrs/src/components/Table/Table.vue'

  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';

	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as events from '@martyrs/src/modules/events/store/events.js';

	import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js'

	// Accessing router
	const route = useRoute()
	const router = useRouter()

	const { hasAccess } = useGlobalMixins()

	// Определение контекста и префикса роутов
	const routePrefix = computed(() => {
		const context = route.meta?.context
		if (context === 'backoffice') return 'Backoffice'
		if (context === 'organization') return 'Organization_'
		return ''
	})

	const getRouteName = (baseName) => `${routePrefix.value}${baseName}`
	// State
	let tab = route.query.tab ? route.query.tab : 'owner';

	const tabEventOwner = ref(tab)

	route.query.tab = tabEventOwner.value

	let filter = ref({
    active: false,
    class: '',
    selected: {},
    options: [{
      title: 'Delivery',
      value: 'delivery',
      options: [
        { label: 'Pickup', value: 'pickup' },
        { label: 'Courier', value: 'courier' },
        { label: 'Post', value: 'post' }
      ]
    },{
      title: 'Prices',  
      value: 'prices',
      options: [
        { label: 'Under 300฿',        value: '<300' },
        { label: '300฿ to 600฿',      value: '300-600' },
        { label: '600฿ to 1200฿',     value: '600-1200' },
        { label: '$1200 and above',   value: '>1200' }
      ]
    }],
  })

  let sort = ref({
    param: 'distance',
    order: 'asc',
    options: [{
      label: 'Distance',
      value: 'distance'
    },{
      label: 'Popularity',
      value: 'views'
    },{
      label: 'Products',
      value: 'numberOfProducts'
    }]
  })

	watch(tabEventOwner, (newValue) => {
	  router.replace({ query: { ...route.query, tab: newValue } });
	});
</script>