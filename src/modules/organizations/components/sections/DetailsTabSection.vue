<template>
	<section class="flex-center flex flex-column t-center pd-medium radius-medium bg-light">

		<Dropdown 
			v-if="user._id !== organization.owner"
			:label="{ component: IconEllipsis, class: 'i-regular t-transp' }"
			:align="'right'"
			class="cursor-pointer pos-absolute pos-r-regular pos-t-regular pd-thin radius-extra "
		>
			<section 
				class="bg-black pd-thin radius-small"
			>
				<FormReport 
					:user="user._id"
					:type="'organization'" 
					:target="organization._id" 
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
					v-if="user._id && user._id !== organization.owner"
		      :user="user._id"
		      :type="'organization'" 
	      	:role="'blocked'" 
		      :target="organization._id" 
		      :status="organization.isBlocked" 
		      :text="{create: 'Block', remove: 'Unblock'}"
		      @updateMembership="event => handleMembershipUpdate(event, 'isBlocked')"
		       class="t-white w-100 mn-t-thin bg-red" 
	    	/>
			</section>
    </Dropdown>

   <router-link
			v-if="user._id === organization.owner"
      :to="{
				name: 'Organization Edit', 
				params: {
					_id: organization._id
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
			v-if="organization.profile.photo" 
			:src="(FILE_SERVER_URL || '') + organization.profile.photo" 
			class="radius-big bg-light flex-center flex mn-b-small w-8r" 
		/>

		<PlaceholderOrganizationPic
			v-else
			class="radius-medium mn-b-small i-extra"
		/>

    <h1
    	class="mn-b-thin"
    >
  		{{ organization.profile.name }}
  	</h1>

   	<div class="flex-center  pd-r-thin pd-l-thin flex-nowrap flex mn-t-thin bg-white radius-extra w-max">
   		<IconFollowing class="i-medium mn-r-micro t-transp"/>

      <p class="mn-t-thin p-medium t-medium uppercase mn-b-thin">{{organization.numberOfSubscribers}} followers</p>

      <ButtonToggleMembership
        v-if="
	      	user._id 
	      	&& route.params._id 
	      	&& route.params._id !== user._id
	      	&& organization.owner !== user._id
	      "
        :user="user._id"
        :type="'organization'" 
        :role="'subscriber'" 
        :target="organization._id" 
        :status="organization.isSubscriber" 
        :text="{create: '+', remove: '-'}"
        @updateMembership="event => handleMembershipUpdate(event, 'isSubscriber', 'numberOfSubscribers')"
        class=" mn-l-thin p-medium t-medium radius-extra i-semi" 
      />
    </div>

    <p class="w-max-50r mn-t-regular mn-b-medium p-big">
   		<Text :text="organization.profile.description || ''" :showToggleText="true" :maxLen="320" />
  	</p>  

  	<Chips 
    	v-if="organization.profile?.tags?.length > 0" 
    	:chips="organization.profile.tags"
    	class="p-medium"
   	/>


    <h4 
    	v-if="Object.values(organization.socials).some(value => value)" 
    	class="mn-t-small mn-b-thin"
    >
  		Find us in socials
  	</h4>
  	
   	<Socials 
   		:telegram="organization.socials.telegram"
   		:facebook="organization.socials.facebook"
   		:instagram="organization.socials.instagram"
   		:twitter="organization.socials.twitter"
   		:youtube="organization.socials.youtube"
   	/>
   	<slot></slot>
	</section>

<!-- <h3 class="mn-b-small">Rating</h3>
	<Rating 
		:rating="organization.rating.median" 
		:amount="organization.rating.amount"
		class="pd-medium mn-b-thin radius-big bg-light"
	/>

	<h3 class="mn-b-small">Contacts</h3>
  <Contacts
    :website="organization.contacts.website"
    :phone="organization.contacts.phone"
    :email="organization.contacts.email"
    :address="organization.contacts.address"
    class="w-100 pd-medium radius-big bg-light"
  /> -->


</template>

<script setup>
	import { ref, computed } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import components
	import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";
	import Text  		from '@martyrs/src/components/Text/Text.vue'
	import Chips  from '@martyrs/src/components/Chips/Chips.vue'
	// Icons
	import IconFollowing from '@martyrs/src/modules/icons/entities/IconFollowing.vue'
	import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
	import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'
	import PlaceholderOrganizationPic from '@martyrs/src/modules/icons/placeholders/PlaceholderOrganizationPic.vue'
	// Org Module
	import ButtonToggleMembership from '@martyrs/src/modules/organizations/components/elements/ButtonToggleMembership.vue'
	import Contacts from '@martyrs/src/modules/organizations/components/blocks/Contacts.vue'
	import Rating from '@martyrs/src/modules/organizations/components/blocks/Rating.vue'
	import Socials from '@martyrs/src/modules/organizations/components/blocks/Socials.vue'
	// Report Module
	import FormReport from '@martyrs/src/modules/reports/components/sections/FormReport.vue' 
	// Store 
	import * as organizations 	from '@martyrs/src/modules/organizations/store/organizations.js'
	import * as memberships 	from '@martyrs/src/modules/organizations/store/memberships.js'
	// ///////////////////////////////////////
 	// Components Props
 	// ///////////////////////////////////////
	const props = defineProps({
		organization: Object,
		user: Object
	})
	// Store
	const route = useRoute()
	
	// Methods
	const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
	  memberships.mutations.handleMembershipUpdate(organizations.state.current, membership, status, target, statusName, statusNumber)
	};
</script>

<style lang="scss">

</style>