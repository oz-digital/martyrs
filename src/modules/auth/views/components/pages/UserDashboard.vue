<template>
	<div class="pd-medium bg-white">
		<h2 class="mn-b-small">Overview</h2>
		<div class="mn-b-medium cols-3 mobile:cols-1 gap-thin">
			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+12.5%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconGroups class="i-medium mn-small"/></div>
				<p class="h3 mn-b-thin">{{ stats.organizations || 0 }}</p>
				<p>My Groups</p>
			</Block>

			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+14.8%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconOrders class="i-medium mn-small"/></div>
				<p class="h3 mn-b-thin">{{ stats.orders || 0 }}</p>
				<p>My Orders</p>
			</Block>

			<Block class="pos-relative">
				<span class="t-green t-semi pos-absolute pos-t-medium pos-r-medium">+25.1%</span>
				<div class="mn-b-medium radius-small w-max bg-main"><IconEvents class="i-medium mn-small"/></div>
				<p class="h3 mn-b-thin">{{ stats.events || 0 }}</p>
				<p>My Events</p>
			</Block>
		</div>

		<div class="cols-2 mobile:cols-1 gap-thin">
			<Block
				title="Recent Orders"
				class="pos-relative"
			>
				<Feed
	        :showLoadMore="false"
	        :LoadMore="false"
	        :states="{
	          empty: {
	            title: 'No Orders',
	            description: 'You have no orders yet.'
	          }
	        }"
	        :store="{
	          read: (options) => orders.actions.read(options),
	          state: orders.state
	        }"
	        :options="{
	            customer: auth.state.user._id,
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
					    key: 'positions',
					    label: 'Items',
					    formatter: (value) => value?.length || 0
					  },
					  {
					    key: 'status',
					    label: 'Status',
					    component: StatusBadge
					  },
					  {
					    key: 'createdAt',
					    label: 'Date',
					    formatter: (value) => new Date(value).toLocaleDateString()
					  }]"
					/>
	      </Feed>

			</Block>

			<Block
				title="Upcoming Events"
				class="pos-relative"
			>
				<Feed
	        :showLoadMore="false"
	        :LoadMore="false"
	        :states="{
	          empty: {
	            title: 'No Events',
	            description: 'You have no upcoming events.'
	          }
	        }"
	        :store="{
	          read: (options) => events.read(options),
	        }"
	        :options="{
	            creator: auth.state.user._id,
	            sortParam: 'date.start',
	            sortOrder: 'asc',
	            limit: 5,
	            page: 1
	        }"
	        v-slot="{
	          items
	        }"
	        class="cols-1 gap-thin"
	      >
					<CardEvent
	          v-for="event in items"
	          :key="event._id"
	          :event="event"
	          :user="auth.state.user._id"
	          :type="'compact'"
	          class="bg-light radius-medium"
	        />
	      </Feed>
			</Block>
		</div>

	</div>


</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import Block from '@martyrs/src/components/Block/Block.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Table from '@martyrs/src/components/Table/Table.vue'
import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue'

import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';

import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue'
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue'
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue'

import * as auth  from '@martyrs/src/modules/auth/views/store/auth.js'
import * as orders  from '@martyrs/src/modules/orders/store/orders.js'
import * as events from '@martyrs/src/modules/events/store/events.js'

const route = useRoute()
const router = useRouter()

const stats = ref({
  organizations: 0,
  orders: 0,
  events: 0
})

onMounted(async () => {
  // Load user stats if needed
})
</script>

<style lang="scss">
</style>
