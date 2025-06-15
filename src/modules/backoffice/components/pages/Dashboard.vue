<template>
	<div class="pd-medium bg-white">
		<h2 class="mn-b-small">Overview</h2>
		<div class="mn-b-medium cols-3 mobile:cols-1 gap-thin">
			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+12.5%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconProfile class="i-semi mn-small"/></div>
				<p class="h3 mn-b-thin">2,453</p>
				<p>Active Members</p>
			</Block>

			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+14.8%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconOrders class="i-semi mn-small"/></div>
				<p class="h3 mn-b-thin">432</p>
				<p>New Orders</p>
			</Block>

			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+25.1%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconProfile class="i-semi mn-small"/></div>
				<p class="h3 mn-b-thin">$23,232</p>
				<p>Monthly Revenue</p>
			</Block>
		</div>

		<div class="cols-2 gap-thin">
			<Block 
				title="Recent Orders"
				class="pos-relative"
			>
				<Feed
	        :showLoadMore="false"
	        :LoadMore="false"
	        :states="{
	          empty: {
	            title: 'No Events Today',
	            description: 'Currently, there are no events available.'
	          }
	        }"
	        :store="{
	          read: (options) => orders.actions.read(options),
	          state: orders.state
	        }"
	        :options="{
	            user: auth.state.user._id,
	            limit: 5,
	            page: 1
	        }"
	        v-slot="{ 
	          items 
	        }"
	        class="cols-1 gap-thin"
	      >
					<Table 
						class="radius-semi bg-white"
						:items="items"
						:columns="[{ 
					    key: '_id', 
					    label: 'ID',
							formatter: (value) => `#${value.slice(0, 4)}...${value.slice(-4)}` 
					  },
					  { 
					    key: 'customer.target.profile.name', 
					    label: 'Name',
					    formatter: (value) => `👤 ${value}`
					  },
					  { 
					    key: 'positions', 
					    label: 'Name',
					    formatter: (value) => value?.length || 0
					  },
					  {
					    key: 'status',
					    label: 'Status',
					    component: StatusBadge
					  },
					  {
					    key: 'createdAt',
					    label: 'Metadata',
					    formatter: (value) => new Date(value).toLocaleDateString()
					  }]" 
					/>
	      </Feed>

			</Block>

			<Block 
				title="Activity Feed"
				class="pos-relative"
				>
			</Block>
		</div>

	</div>


</template>

<script setup="props">
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
import { ref, onMounted } from 'vue';

// Mobile Module
import Block from '@martyrs/src/components/Block/Block.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Table from '@martyrs/src/components/Table/Table.vue'
import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue'


import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue'

import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue'
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

import * as auth  from '@martyrs/src/modules/auth/views/store/auth.js'
import * as organizations  from '@martyrs/src/modules/organizations/store/organizations.js'
import * as orders  from '@martyrs/src/modules/orders/store/orders.js'

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


const columns = [
  
]
/////////////////////////////
// MOUNTED
/////////////////////////////
onMounted(async () =>{
})
</script>

<style lang="scss">
</style>