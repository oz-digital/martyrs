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
    		@click="router.push({name: 'Create Event'})" 
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
					br-b br-solid br-black-transp
				"
				classTab="bg-light pd-small radius-small w-100"
			/>

			<Feed
				:search="true"
				v-model:sort="sort"
				v-model:filter="filter"
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
	        @click="$router.push({name: 'Event', params: {url: event.url}})" 
	        v-for="(event,index) in items" 
	        :key="event._id" 
	        :event="event" 
	        :user="auth.state.user._id" 
	        :type="'normal'"
	        class="bg-light radius-big"
	      >

			     <div 
			      v-if="route.params._id || route.params.user && hasAccess(route.params._id, 'events', 'read', auth.state.accesses, auth.state.access.roles)"
			      class="mn-b-semi w-100 bg-second button t-white uppercase"
			      @click.stop="router.push({
			        name: 'Edit Event Tickets',
			        params: {
			          url: event.url
			        }
			      })"
			    >
			      Manage Tickets
			    </div>
	      </CardEvent>
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
	import { watch, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Components
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

import Table from '@martyrs/src/components/Table/Table.vue'

  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';

	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as events from '@martyrs/src/modules/events/store/events.js'; 
	// Accessing router
	const route = useRoute()
	const router = useRouter()
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