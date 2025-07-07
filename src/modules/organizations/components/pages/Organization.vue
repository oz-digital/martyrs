<template>
	<div v-if="organizationData" class="pd-thin for-transition w-100">

		<!-- <Breadcrumbs class="mn-b-thin pd-medium bg-light radius-big"/> -->
		<!-- <pre>{{organization.state.current}}</pre> -->

		<DetailsTabSection 	
			:organization="organization.state.current" 
			:user="auth.state.user"
			class="mn-b-thin"
		>

		</DetailsTabSection>

		<Tab 
			v-model:selected="tabOrganization"
			:tabs="[
				{ name: 'Community', value: 'community' },
				{ name: 'Menu', value: 'products' },	
				{ name: 'Events', value: 'events' },
				{ name: 'Spots', value: 'spots' }	
			]"
			class="mn-b-thin o-x-scroll scroll-hide flex-child-default o-hidden t-medium p-medium radius-medium pd-thin bg-light"
		/>

		<div class="h-100 pos-relative">

			<transition name="slide-fade">
		    <Feed
		    	v-if="tabOrganization === 'community'"
			    :showLoadMore="false"
			    :states="{
			      empty: {
			        title: 'No Blog Posts Found',
			        description: 'Currently, there are no posts available in this blog. Please check back later.'
			      }
			    }"
			    :store="{
			      read: (options) => blog.read(options)
			    }"
			    :options="{
			      status: 'published',
			      user: auth.state.user._id,
			      owner: route.params._id,
			    }"
			    v-slot="{ 
			      items 
			    }"
			    class="rows-1 gap-thin"
			  >
			    <CardBlogpost 
			      v-for="item in items" 
			      :key="item._id" 
			      :blogpost="item" 
			      :user="auth.state.user._id" 
			      class="h-max-40r bg-light radius-medium"
			    />
			  </Feed>
			</transition>

	
			<transition name="slide-fade">
				<FeedEvents 
					v-if="tabOrganization === 'events'"
			  	:user="auth.state.user._id"
					:owner="route.params._id"
					:sortOrder="'desc'"
					:sortParam="'date.start'"
				/>
			</transition>

			

			<transition name="slide-fade">
				<Products 
					v-if="tabOrganization === 'products'"
					:organization="organization.state.current"
				>
					<Block
						v-if="hasAccess(route.params._id, null, null, auth.state.accesses, auth.state.access.roles)"
						class="o-x-scroll pd-small scroll-hide w-100 pos-relative mn-b-thin"
					>
						<div class="w-100 gap-thin flex flex-nowrap	 o-x-scroll">
							<router-link 
								class="bg-black t-nowrap t-white uppercase t-semi pd-thin radius-small "
								:to="{
									name:'Organization_ProductAdd', 
									params: {
										_id: route.params._id
									}
								}"
								>
								Add Product
							</router-link>

							<router-link 
								class=" uppercase t-nowrap t-semi  pd-thin"
								:to="{
									name:'OrganizationInventoryList', 
									params: {
										_id: route.params._id
									}
								}"
								>
								Change Invetory
							</router-link>

							
							<router-link 
								class="d-block t-nowrap  mn-l-auto uppercase t-semi bg-white pd-thin radius-small "
								:to="{
									name:'Backoffice', 
									params: {
										_id: route.params._id
									}
								}"
								>
								Go to Backoffice
							</router-link>
						</div>
					</Block>
				</Products>

			</transition>

			<transition name="slide-fade">
				<div v-if="tabOrganization === 'spots'">
					<Feed
			      :states="{
			        empty: {
			          title: 'No Spots Found',
			          description: 'Currently, there are no spots available.'
			        }
			      }"
			      :store="{
			        read: (options) => spots.actions.read(options),
			        state: organization.state
			      }"
			      :options="{
			        	user: auth.state.user._id,
								organization: route.params._id,
								limit: 10
			      }"
			      v-slot="{ 
			        items 
			      }"
			    >
			    	<CardSpot
		          v-for="(spot, index) in items"
		          :key="index"
		          :spot="spot"
		          :organization="organization.state.current"
		          :editAccess="hasAccess(route.params._id, 'spots', 'edit', auth.state.accesses, auth.state.access.roles)"
		          :showDeliveryOptions="true"
		          :showPaymentOptions="true"
		          class="radius-medium h-min-big bg-light mn-b-thin"
		        />
			    </Feed>

			    <button
	          v-if="hasAccess(route.params._id, 'spots', 'create', auth.state.accesses, auth.state.access.roles)"
	          @click="$router.push(`/spots/${organization.state.current._id}/spots/create`)"
	          class="mn-b-thin bg-main button w-100"
	        >
	          Add spot
	        </button>

				</div>
			</transition>

		</div>
	</div>
</template>

<script setup>
	import { computed, reactive, ref, onMounted, watch  } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import components
	import Breadcrumbs 	from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'
	import Block  		from '@martyrs/src/components/Block/Block.vue'
	import Feed from '@martyrs/src/components/Feed/Feed.vue'
	// Community
	  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue';
	// Mobile Module
	import Menu from '@martyrs/src/components/Menu/Menu.vue'
	import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'
	// Organizations
	import DepartmentSub from '@martyrs/src/modules/organizations/components/blocks/DepartmentSub.vue';
	import DetailsTabSection from '@martyrs/src/modules/organizations/components/sections/DetailsTabSection.vue'
	import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
	// Feeds
	import FeedEvents from '@martyrs/src/modules/events/components/sections/Feed.vue'; 
	// Spots
	import CardSpot from '@martyrs/src/modules/spots/components/blocks/CardSpot.vue';	
	// Local
	import Products from '@martyrs/src/modules/products/components/pages/Products.vue';
	// Import state
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';
	import * as memberships from '@martyrs/src/modules/organizations/store/memberships.js';
	import * as departments from '@martyrs/src/modules/organizations/store/departments.js';
	// Community
  import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
	// Spots
	import * as spots from '@martyrs/src/modules/spots/store/spots.js';
	// Init router
	const router 	= useRouter()
	const route 	= useRoute()
	// Accesing state
	let tab = route.query.tab ? route.query.tab : 'products';

	const organizationData = ref(null)

	const tabOrganization = ref(tab)

	route.query.tab = tabOrganization.value

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
