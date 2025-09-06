<template>
	<div v-if="organizationData" class="pd-thin for-transition w-100">

		<!-- <Breadcrumbs class="mn-b-thin pd-medium bg-light radius-medium"/> -->
		<!-- <pre>{{organization.state.current}}</pre> -->

		<section class="flex-center flex flex-column t-center pd-medium radius-medium bg-light mn-b-thin">

			<Dropdown 
				v-if="auth.state.user._id !== organization.state.current.owner"
				:label="{ component: IconEllipsis, class: 'i-regular t-transp' }"
				:align="'right'"
				class="cursor-pointer pos-absolute pos-r-regular pos-t-regular pd-thin radius-extra "
			>
				<section 
					class="bg-black pd-thin radius-small"
				>
					<FormReport 
						:user="auth.state.user._id"
						:type="'organization'" 
						:target="organization.state.current._id" 
						:text="'Report'" 
						class="w-100"
					>
						<button 
							class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
						>
							Report
						</button>
					</FormReport>

					<ButtonToggleMembership
						v-if="auth.state.user._id && auth.state.user._id !== organization.state.current.owner"
			      :user="auth.state.user._id"
			      :type="'organization'" 
	      	:role="'blocked'" 
			      :target="organization.state.current._id" 
			      :status="organization.state.current.isBlocked" 
			      :text="{create: 'Block', remove: 'Unblock'}"
			      @updateMembership="event => handleMembershipUpdate(event, 'isBlocked')"
			       class="t-white w-100 mn-t-thin bg-red" 
	    	/>
				</section>
	    </Dropdown>

	   <router-link
				v-if="auth.state.user._id === organization.state.current.owner"
	      :to="{
					name: 'Organization Edit', 
					params: {
						_id: organization.state.current._id
					}
				}" 
	      class="
	      	z-index-2
	        cursor-pointer 
	        pos-absolute pos-t-regular pos-r-regular
	        radius-extra pd-thin bg-second
	      "
	    >
	      <IconEdit
	        class="i-regular"
	        classes="fill-white"
	      />
	    </router-link>


			<img loading="lazy" 
				v-if="organization.state.current.profile.photo" 
				:src="(FILE_SERVER_URL || '') + organization.state.current.profile.photo" 
				class="radius-medium bg-light flex-center flex mn-b-small w-8r" 
			/>

			<PlaceholderOrganizationPic
				v-else
				class="radius-medium mn-b-small i-extra"
			/>

	    <h1
	    	class="mn-b-thin"
	    >
	  		{{ organization.state.current.profile.name }}
	  	</h1>

	   	<div class="flex-center  pd-r-thin pd-l-thin flex-nowrap flex mn-t-thin bg-white radius-extra w-max">
	   		<IconFollowing class="i-medium mn-r-micro t-transp"/>

	      <p class="mn-t-thin p-medium t-medium uppercase mn-b-thin">{{organization.state.current.numberOfSubscribers}} followers</p>

	      <ButtonToggleMembership
	        v-if="
		      	auth.state.user._id 
		      	&& route.params._id 
		      	&& route.params._id !== auth.state.user._id
		      	&& organization.state.current.owner !== auth.state.user._id
		      "
	        :user="auth.state.user._id"
	        :type="'organization'" 
	        :role="'subscriber'" 
	        :target="organization.state.current._id" 
	        :status="organization.state.current.isSubscriber" 
	        :text="{create: '+', remove: '-'}"
	        @updateMembership="event => handleMembershipUpdate(event, 'isSubscriber', 'numberOfSubscribers')"
	        class=" mn-l-thin p-medium t-medium radius-extra i-semi" 
	      />
	    </div>

	    <!-- <p class="w-max-50r mn-t-regular mn-b-medium p-semi">
	   		<Text :text="organization.profile.description || ''" :showToggleText="true" :maxLen="320" />
	  	</p>   -->

	  	<Chips 
	    	v-if="organization.state.current.profile?.tags?.length > 0" 
	    	:chips="organization.state.current.profile.tags"
	    	class="p-medium"
	   	/>


	    <h4 
	    	v-if="Object.values(organization.state.current.socials).some(value => value)" 
	    	class="mn-t-small mn-b-thin"
	    >
	  		Find us in socials
	  	</h4>
	  	
	   	<Socials 
	   		:telegram="organization.state.current.socials.telegram"
	   		:facebook="organization.state.current.socials.facebook"
	   		:instagram="organization.state.current.socials.instagram"
	   		:twitter="organization.state.current.socials.twitter"
	   		:youtube="organization.state.current.socials.youtube"
	   	/>
		</section>
		
		<!-- Backoffice -->
		<div v-if="MOBILE_APP" @click="() => globals.state.isOpenSidebar = !globals.state.isOpenSidebar"  class="pos-relative">
			<div class="bg-light radius-medium pd-medium">
				<p class="t-medium t-black-transp-60">
					Show Menu
				</p>
			</div>
		</div>

		<!-- Organization Info Section -->
		<!-- <div class="pos-relative">
			<div class="bg-light radius-medium pd-medium">
				<h3 class="mn-b-small">About {{ organization.state.current?.profile?.name }}</h3>
				<p v-if="organization.state.current?.profile?.description" class="t-medium">
					{{ organization.state.current.profile.description }}
				</p>
				<p v-else class="t-medium t-black-transp-60">
					No description available.
				</p>
			</div>
		</div> -->

		<Products/>
	</div>
</template>

<script setup>
	import { computed, reactive, ref, onMounted, watch  } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import components
	import Breadcrumbs 	from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
	import Block  		from '@martyrs/src/components/Block/Block.vue'
	import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";
	import Text  		from '@martyrs/src/components/Text/Text.vue'
	import Chips  from '@martyrs/src/components/Chips/Chips.vue'
	// Mobile Module
	import Menu from '@martyrs/src/components/Menu/Menu.vue'
	import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'
	// Icons
	import IconFollowing from '@martyrs/src/modules/icons/entities/IconFollowing.vue'
	import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
	import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'
	import PlaceholderOrganizationPic from '@martyrs/src/modules/icons/placeholders/PlaceholderOrganizationPic.vue'
	// Organizations
	import { 
		DepartmentSub, 
		ButtonToggleMembership, 
		Contacts, 
		Rating, 
		Socials 
	} from '@martyrs/src/modules/organizations/organizations.client.js'
	import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
	// Report Module
	import FormReport from '@martyrs/src/modules/reports/components/sections/FormReport.vue'
	// Products modu;e
	import Products from '@martyrs/src//modules/products/components/pages/Products.vue'
	// Import state
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
	import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'

	import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';
	import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js';
	import departmentsStore from '@martyrs/src/modules/organizations/store/departments.store.js';
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

 		await membershipsStore.read({target: route.params._id})

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

	// Methods
	const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
	  membershipsStore.handleMembershipUpdate(organization.state.current, membership, status, target, statusName, statusNumber)
	};
</script>

<style lang="scss">
</style>
