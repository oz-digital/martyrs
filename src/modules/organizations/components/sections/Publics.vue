<template>
	<div class="w-100 o-scroll">
		<EmptyState 
      		v-if="!publics || publics.length < 1"
      		title="Unfortunately, we couldn't find any recommendations for you"
      		description="Explore and find a community or organization that suits your interests."
      		class="radius-medium bg-light pd-medium"
    	/>
    	
	    <div v-else class="w-max gap-thin flex-nowrap flex">
	    	<CardOrganization 
	    		v-if="publics"
	        	v-for="(organization,index) in publics" 
	        	:key="organization._id" 
		      	:organization="organization"
		      	:user="auth.state.user"
						@updateMembership="event => handleMembershipUpdate(event, 'isSubscriber', 'numberOfSubscribers')"
						class="w-max-20r radius-medium"
		    />
		</div>
	</div>
</template>

<script setup>
	import { onMounted, ref } from 'vue'
	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'
	import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue'
	
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'
	import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'

	let publics = ref(null)

	onMounted(async () => {
		publics.value = await organization.actions.read({
			user: auth.state.user._id,
			sortParam: "profile.tags",
			limit: 10,
		});
	});

	// Methods
	const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
	  membershipsStore.handleMembershipUpdate(publics.value, membership, status, target, statusName, statusNumber)
	};
</script>

<style lang="scss">
	.slide-fade-enter-active {
		// min-height: 100vh;
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide-fade-leave-active {
		// min-height: 100vh;
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		min-height: 0;
		position: absolute;
	  transform: translateX(20px);
	  opacity: 0;
	  left: 0;
	  top: 0;
	}

</style>
