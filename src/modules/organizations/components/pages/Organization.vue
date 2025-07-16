<template>
	<div v-if="organizationData" class="pd-thin for-transition w-100">

		<!-- <Breadcrumbs class="mn-b-thin pd-medium bg-light radius-big"/> -->
		<!-- <pre>{{organization.state.current}}</pre> -->

		<DetailsTabSection 	
			:organization="organization.state.current" 
			:user="auth.state.user"
			class="mn-b-thin"
		/>

		<!-- Organization Info Section -->
		<div class="pos-relative">
			<div class="bg-light radius-medium pd-medium">
				<h3 class="mn-b-small">About {{ organization.state.current?.profile?.name }}</h3>
				<p v-if="organization.state.current?.profile?.description" class="t-medium">
					{{ organization.state.current.profile.description }}
				</p>
				<p v-else class="t-medium t-black-transp-60">
					No description available.
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, reactive, ref, onMounted, watch  } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import components
	import Breadcrumbs 	from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
	import Block  		from '@martyrs/src/components/Block/Block.vue'
	// Mobile Module
	import Menu from '@martyrs/src/components/Menu/Menu.vue'
	import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'
	// Organizations
	import DepartmentSub from '@martyrs/src/modules/organizations/components/blocks/DepartmentSub.vue';
	import DetailsTabSection from '@martyrs/src/modules/organizations/components/sections/DetailsTabSection.vue'
	import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
	// Import state
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';
	import * as memberships from '@martyrs/src/modules/organizations/store/memberships.js';
	import * as departments from '@martyrs/src/modules/organizations/store/departments.js';
	// Init router
	const router 	= useRouter()
	const route 	= useRoute()

	const organizationData = ref(null)

	onMounted(async () => {
		
		organizationData.value = await organization.actions.read({
			_id: route.params._id, 
			user: auth.state.user._id,
			lookup: ['memberships']
		})

 		await memberships.actions.read({target: route.params._id})

 		if (typeof gtag === 'function') {
			gtag('event', 'view_organization', {
				organization_id: route.params._id,
				organization_name: organizationData.value?.profile?.name || 'unknown',
				page_path: window.location.pathname,
				user_id: auth.state.user._id || 'anonymous',
				timestamp: new Date().toISOString()
			});
		}
	})
</script>

<style lang="scss">
</style>
