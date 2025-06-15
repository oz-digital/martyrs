<template>
	<div>
		<header v-if="!MOBILE_APP"  class="pd-small bg-white flex-v-center flex-nowrap flex">
    	<h2 class="mn-r-medium">Groups</h2>
    	<button 
    		@click="$router.push({
    			name: 'Create Organization'
    		})" 
    		class="
    			bg-second
    			radius-100 
    			i-big 
    			hover-scale-1
    			cursor-pointer
    			t-white
    			bg-second
    		">
    			+
    	</button>
		</header>
		<Tab 
			v-model:selected="tabOrganization"
			:tabs="[
				{ name: 'Owner', 		value: 'owner' },
				{ name: 'Member', 	value: 'member' },
				{ name: 'Follower', value: 'follower' }		
			]"
			style="flex: 1 0 auto;"
			class="
				o-hidden 
				h5 
				bg-white
				gap-micro pd-small pd-t-thin pd-b-thin
				br-b br-solid br-black-transp
			"
			tabClass="bg-light pd-small radius-small w-100"
		/>
			<div class="pd-small  h-100  bg-white">
				<transition name="slide-fade">
					<Feed
		        :showLoadMore="false" 
		        :search="{
		          placeholder: 'Search organization...',
		          class: 'mn-b-small'
		        }"
		        :states="{
		          empty: {
		            title: 'No organizations Found',
		            description: 'Currently, there are no such organizations available.'
		          }
		        }"
		        :store="{
		          read: (options) => organizations.actions.read(options),
		          state: null
		        }"
		        :options="{
		          user: auth.state.user._id,
		          [tabOrganization === 'owner' ? 'owner' : 
		           tabOrganization === 'member' ? 'member' : 'subscriber']: route.params._id,
		          lookup: ['memberships']
		        }"
		        v-slot="{ 
		          items 
		        }"
		         style="height: 200rem"
		      >
		      	<CardOrganization 
					   	v-for="(organization, index) in items" 
		          v-memo="[organization._id, organization.profile.name]"
					    :organization="organization"
					    :showRating="true"
					    :showFollowers="true"
					    :showProducts="false"
					    class="bg-light mn-b-thin w-100 o-hidden radius-big pd-medium"
					  />
		      </Feed>
			</transition>
		</div>
	</div>
</template>

<script setup>
	import { watch, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Components
	import Tab from '@martyrs/src/components/Tab/Tab.vue'
	import Feed from '@martyrs/src/components/Feed/Feed.vue'

	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';

	import Card from '@martyrs/src/modules/globals/views/components/blocks/Card.vue';
	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

	// Accessing router
	const route = useRoute()
	const router = useRouter()
	// State
	let tab = route.query.tab ? route.query.tab : 'owner';

	const tabOrganization = ref(tab)

	route.query.tab = tabOrganization.value

	watch(tabOrganization, (newValue) => {
	  router.replace({ query: { ...route.query, tab: newValue } });
	});
</script>