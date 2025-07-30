<template>
	<div class="for-transition bg-white radius-medium w-100">
		<div class="">
			 <EmptyState 
        v-if="organizations < 1"
        title="You Haven't Joined Any Organization Yet"
        description="Weeder is all about community. Join an organization or maybe you want to create your own?"
        action="Create organization"
        :callback="a = () => $router.push(`/app/organization/create/details`)"
      />

      <div v-else class="cols-1">
      	<CardOrganization 
	    			 v-for="organization in organizations" 
		      	:key="organization._id"
		      	:organization="organization"
		      	:user="auth.state.user"
						@updateMembership="handleMembershipUpdate"
						class="w-100"
						:class="{'mn-r-small': index !== organizations.length - 1}"
		    />
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed,reactive,ref, onMounted,watch  } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import dependencies
	import Cookies from 'js-cookie'
	// Import components
	// Global
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'
	import Field  	from '@martyrs/src/components/Field/Field.vue'
	import Select  	from '@martyrs/src/components/Select/Select.vue'
	import Button  	from '@martyrs/src/components/Button/Button.vue'
	// Local
	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'
	// Blocks
	import EmptyState 		from '@martyrs/src/modules/organizations/components/blocks/EmptyState.vue'
	import Unit   	from '@martyrs/src/modules/organizations/components/sections/Unit.vue'
	// Import state
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'
	import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'

	const props = defineProps({
    owner: {
      type: String,
      default: null
    },
    user: {
      type: [String, Number],
      default: null
    },
    onlyuser: {
      type: [String, Number],
      default: null
    }
  });

	const organizations = ref(null)

	organizations.value = await organization.actions.read({owner: props.owner, user: props.user, onlyuser: props.onlyuser });
	// Init router
	const router 	= useRouter()
	const route 	= useRoute()
	// Accesing state
	// console.log(route.query.tab)
	let tab = route.query.tab ? route.query.tab : 'details';

	const tabOrganization = ref(tab)

	route.query.tab = tabOrganization.value

	watch(tabOrganization, (newValue) => {
	  router.replace({ query: { ...route.query, tab: newValue } });
	});
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
