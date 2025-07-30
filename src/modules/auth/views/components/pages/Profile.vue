<template>
	<div 
		v-if="show"
		class="for-transition bg-white w-100"
	>
		<div 
			v-if="users.state.current?.status === 'removed'"
			class="flex-center flex pd-medium radius-big bg-light uppercase t-semi w-100 h-100"
		>
			Sorry, user has been removed.
		</div>

		<div 
			v-else
			_id="dash" 
			class="pd-thin w-100"
		>
			<!-- <Completion 
				v-if="route.params._id === auth.state.user._id && show" 
		    :user="auth.state.user._id"
		    :target="users.state.current"
		    :cta="false" 
		    text_cta="Fill"
		    text="Profile completed at"
		    class="mn-b-medium mn-b-regular pd-medium radius-semi t-white bg-second"
			/> -->

			<section 
				class="flex-center pos-relative flex flex-column t-center w-100 mn-b-regular radius-medium pd-medium bg-light"
			>

				<Dropdown 
					v-if="route.params._id && route.params._id !== auth.state.user._id"
					:label="'...'" 
					:align="'right'"
					class="cursor-pointer pos-absolute pos-r-0 pos-t-0 pd-thin radius-extra "
				>
					<section 
						class="bg-black pd-thin radius-small"
					>
						<FormReport 
							:user="auth.state.user._id"
							:type="'user'" 
							:target="users.state.current._id" 
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
							v-if="auth.state.user._id"
				      :user="auth.state.user._id"
				      :type="'user'" 
			      	:role="'blocked'" 
				      :target="users.state.current._id" 
				      :status="users.state.current.isBlocked" 
				      :text="{create: 'Block', remove: 'Unblock'}"
				      @updateMembership="event => handleMembershipUpdate(event, 'isBlocked')"
				      class="t-white mn-t-thin bg-red" 
			    	/>
					</section>
	      </Dropdown>	


				<IconEdit
					v-if="route.params._id === auth.state.user._id"
					@click="$router.push({
						name: 'Profile Edit Profile', 
						params: {
							_id: auth.state.user._id
						}
					})" 
					class="cursor-pointer pos-absolute pos-t-regular pos-r-regular i-regular t-transp"
				/>

				<img loading="lazy" 
					v-if="users.state.current.profile.photo && users.state.current.profile.photo.length > 0" 
					:src="(FILE_SERVER_URL || '') + users.state.current.profile.photo" 
					class="radius-extra bg-white mn-b-small object-fit-cover i-extra" 
				/>
				
				<PlaceholderUserpic 
					v-else 
					class="radius-medium mn-b-small i-extra"
				/>

				<h3 
					class="mn-b-thin"
				>
					{{users.state.current.profile.name ? users.state.current.profile.name : 'Anonymous' }}
				</h3>
				
				<p 
					v-if="users.state.current.username"
					class="mn-b-thin t-main t-semi"
				>
					@{{ users.state.current.username ? users.state.current.username : 'Not specified' }}
				</p>

				<p 
					class="mn-b-small p-medium"
				>
				 {{ users.state.current.profile.description ? users.state.current.profile.description : 'Bio not specified' }}
				</p>
				
				<div class="mn-b-medium flex-center flex-nowrap flex">
					<div 
					  v-for="(role,index) in users.state.current.roles" 
					  class="pd-thin radius-small t-semi bg-white" 
					  :class="{'mn-r-thin': index !== users.state.current.roles.length - 1}"
					 >
						{{role.icon}}
						{{role.name}}
					</div>
				</div>			

				<p 
					class="t-semi mn-b-small"
				>
					<!-- 👍 3 212 likes ·  -->
					<!-- 💬 342 comments ·  -->
					👨‍👨‍👧‍👧 {{users.state.current.numberOfSubscribers}} followers
				</p>
				
	    	<ButtonToggleMembership
	    		v-if="auth.state.user._id && route.params._id && route.params._id !== auth.state.user._id"
		      :user="auth.state.user._id"
		      :type="'user'" 
	      	:role="'subscriber'" 
		      :target="users.state.current._id" 
		      :status="users.state.current.isSubscriber" 
					:text="{create: 'Follow', remove: 'Unfollow'}"
		      @updateMembership="event => handleMembershipUpdate(event, 'isSubscriber', 'numberOfSubscribers')"
		      class="w-min mn-b-medium	mn-r-auto mn-l-auto" 
	    	/>

	    	<h4 
	      	v-if="Object.values(users.state.current.socials).some(value => value)" 
	      	class="mn-t-small mn-b-thin"
	      >
	    		Find Me in Socials
	    	</h4>
	     	<Socials 
	     		:telegram="users.state.current.socials.telegram"
	     		:facebook="users.state.current.socials.facebook"
	     		:instagram="users.state.current.socials.instagram"
	     		:twitter="users.state.current.socials.twitter"
	     		class="mn-r-auto mn-l-auto"
	     	/>

			</section>
			
			<RouterView />

			<Menu class="mn-b-regular bg-light">
	      <template v-for="(module, moduleName) in modules" :key="moduleName">
	        <MenuItem 
	          v-if="isModuleInstalled(moduleName) && (!module.visible || module.visible(auth))"
	          @click="router.push({
	            name: `${module.route}`, 
	            params: {
	              _id: route.params._id,
	              user: route.params._id
	            }
	          })" 
	          class="profile-menu-item cursor-pointer"
	        >
	          <component 
	            :is="module.icon" 
	            v-if="module.icon"
	            class="i-semi" 
	            :icon="true"
	          />
	          <span>{{ module.displayName }}</span>
	        </MenuItem>
	      </template>
   		</Menu>
			  
			<Menu 
				v-if="auth.state.user._id === route.params._id"
				class="bg-light"
			>
				<MenuItem 
			  	@click="router.push({
			  		name: 'Notifications', 
			  		params: {
			  			_id: route.params._id
			  		}
			  	})" 
			  	class="cursor-pointer">
			    <span>
			    	Notifications
			    </span>
			  </MenuItem>
			  <MenuItem 
			  	@click="router.push({
			  		name: 'Profile Edit Profile', 
			  		params: {
			  			_id: route.params._id
			  		}
			  	})" 
			  	class="cursor-pointer">
			    <span>
			    	Settings
			    </span>
			  </MenuItem>

			  <MenuItem 
			  	@click="router.push({
			  		name: 'Legal', 
			  		params: {
			  			_id: route.params._id
			  		}
			  	})" 
			  	class="cursor-pointer">
			    <span>
			    	About
			    </span>
			  </MenuItem>
			  
			  <MenuItem 
			  	class="cursor-pointer"
					@click="logout()"
			  >
			    <span 
			    	class="t-red"
			    >
			    	Logout
			    </span>
			  </MenuItem>
			</Menu>

		</div>
	</div>
</template>

<script setup>
// Import components
import Field         from '@martyrs/src/components/Field/Field.vue'
import Button        from '@martyrs/src/components/Button/Button.vue'
import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";
import Completion from '@martyrs/src/components/Completion/Completion.vue'
// Mobile Module
import Menu from '@martyrs/src/components/Menu/Menu.vue'
import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'
// Org Module
import ButtonToggleMembership from '@martyrs/src/modules/organizations/components/elements/ButtonToggleMembership.vue'
// Report Module
import FormReport from '@martyrs/src/modules/reports/components/sections/FormReport.vue'   
// Community Module 
import Activity from '@martyrs/src/modules/community/components/blocks/Activity.vue'; 
import Socials from '@martyrs/src/modules/organizations/components/blocks/Socials.vue'
// Icons Module
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue'
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue'
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue'
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue'

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'

import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'
// Import libs
import { computed, watch, onMounted, ref, onBeforeMount, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import state
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as users from '@martyrs/src/modules/auth/views/store/users.js'
import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js'
// Accessing router
const route = useRoute()
const router = useRouter()
// Get organization _id from cookie
const show = ref(false)

const store = inject('store')
const { isModuleInstalled } = useGlobalMixins()

const modules = {
  events: {
    displayName: 'Events',
    route: 'User Events',
    icon: IconEvents,
    visible: () => true
  },
  organizations: {
    displayName: 'Groups',
    route: 'User Organizations',
    icon: IconGroups,
    visible: () => true
  },
  blogposts: {
    displayName: 'Posts',
    route: 'User Posts',
    icon: IconCommunity,
    visible: () => true
  },
  orders: {
    displayName: 'Orders',
    route: 'UserOrdersList',
    icon: IconOrders,
    visible: (auth) => auth.state.user && (
      auth.state.user._id === route.params._id || 
      (auth.state.access && auth.state.access.roles && 
        (auth.state.access.roles.includes('ROLE_MODERATOR') || 
         auth.state.access.roles.includes('ROLE_ADMIN'))
      )
    )
  }
}


onMounted(async () => {
 	await users.actions.read({ _id: route.params._id, user: auth.state.user._id });
 	show.value = true
})

const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
  membershipsStore.handleMembershipUpdate(users.state.current, membership, status, target, statusName, statusNumber)
};

function logout () {
  auth.actions.logout()

  router.push({name: 'Sign In'})
}
</script>

<style lang="scss">
	#header {
		// height: 3rem;
	}
</style>
