<template>
	<header 
		v-if="owner" 
		class="pd-b-zero "
	>
		<div 
			class="w-100 flex-v-center flex-nojustify flex"
		>

			<div
				class="w-100 gap-thin p-regular t-nowrap flex-nowrap flex-v-center flex"
			>
				<img loading="lazy" 
					v-if="owner.target?.profile?.photo?.length > 0 && type !== 'short'" 
					:src="(FILE_SERVER_URL || '') + owner.target.profile.photo" 
					class="radius-medium bg-white flex-child-default object-fit-cover i-medium" 

					@click.stop="$router.push({
						name: owner.type === 'user' ? 'User Profile' : 'Organization', 
						params: {
							_id: owner.target._id
						}
					})" 
				/>
				<component
					v-if="!owner.target?.profile?.photo && type !== 'short'"
					:is="owner.type === 'user' ? PlaceholderUserpic : PlaceholderOrganizationPic"
					class="radius-medium flex-child-default cursor-pointer i-medium"

					@click.stop="$router.push({
						name: owner.type === 'user' ? 'User Profile' : 'Organization', 
						params: {
							_id: owner.target._id
						}
					})" 
				/>

				<div 
					v-if="type !== 'short'"
					class="gap-thin  flex flex-nowrap t-medium w-100 pos-relative"
				>
					<span 
						@click.stop="$router.push({
							name: owner.type === 'user' ? 'User Profile' : 'Organization', 
							params: {
								_id: owner.target._id
							}
						})" 
						class="cursor-pointer w-max t-trim"
					>
						{{owner.target?.profile?.name || creator.target?.username || 'Anonymous'}}
					</span>

					<span v-if="!creator.hidden && owner.target?.profile?.name !== creator.target?.profile?.name">·</span> 

					<span
						v-if="!creator.hidden && owner.target?.profile?.name !== creator.target?.profile?.name"
						@click.stop="$router.push({
							name: 'User Profile', 
							params: {
								_id: creator.target?._id
							}
						})" 
						class="cursor-pointer w-max t-trim"
					>
						<div>by {{creator.target?.profile?.name || creator.target?.username || 'Anonymous'}}</div>
					</span>

					<span v-if="date">·</span> 

					<span v-if="date" class="pos-relative w-max">
						<Tooltip v-if="date" :text="formatDate(date)">
					 		{{getTimeElapsed(date)}}
					 	</Tooltip>
					</span>

					<span v-if="dateFormatted">·</span>

					<span v-if="dateFormatted"> {{dateFormatted}}</span>
				</div>
				

				<!-- Participaters avatar -->
				<div class="d-block mn-l-auto flex-nowrap flex flex-v-center">
					<PhotoStack
						v-if="members"
						:number="members"
			    	:photos="membersPhotos" 
			    />
				</div>

				<!-- Report -->
				<Dropdown 
					v-if="type !== 'short' && user && (user !== creator.target?._id || (actions && actions.length > 0))"
					:label="{ component: IconEllipsis, class: 't-transp i-medium' }"
					:align="'right'"
					class="cursor-pointer z-index-2"
				>
					<section 
						class="bg-black flex-column flex gap-thin pd-thin radius-small"
					>
						<FormReport 
							v-if="user !== creator.target?._id"
							:user="user"
							:type="entityType" 
							:target="entity._id" 
							:text="'Report'" 
							class="w-100"
						>
							<button 
								class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
							>
								Report
							</button>
						</FormReport>

						<template  
			        v-for="action in actions"   
			        v-if="actions && actions.length > 0"
			      >
			        <router-link
			          v-if="action.to"
			          :key="action.to"
			          :to="action.to"
			          :class="action.class || 'w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button'"
			        >
			          {{ action.label }}
			        </router-link>

			        <button
			          v-if="action.method"
			          @click="action.method"
			          :class="action.class || 'w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button'"
			        >
			          {{ action.label }}
			        </button>
			      </template>
					</section>
		    </Dropdown>	
			</div>
		</div>
	</header>
</template>


<script setup="props">
	import { computed,ref } from 'vue'

	import { useRouter } from 'vue-router'

	import Tooltip from '@martyrs/src/components/Tooltip/Tooltip.vue'
	import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";

	import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'
	import PlaceholderOrganizationPic from '@martyrs/src/modules/icons/placeholders/PlaceholderOrganizationPic.vue'
	import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'

	import FormReport from '@martyrs/src/modules/reports/components/sections/FormReport.vue'   
	import ButtonToggleMembership from '@martyrs/src/modules/organizations/components/elements/ButtonToggleMembership.vue'

	import PhotoStack from "@martyrs/src/modules/globals/views/components/elements/PhotoStack.vue"


	const props = defineProps([
		'user',
		'entity',
		'entityType',
		'date',
		'dateFormatted',
		'owner',
		'creator',
		'members',
		'membersPhotos',
		'type',
		'actions'
	])

	const router = useRouter()

	function getTimeElapsed(timestamp) {
	  const now = new Date();
	  const createdAt = new Date(timestamp);
	  const timeDiff = Math.abs(now - createdAt);
	  const seconds = Math.floor(timeDiff / 1000);
	  const minutes = Math.floor(seconds / 60);
	  const hours = Math.floor(minutes / 60);
	  const days = Math.floor(hours / 24);
	  const weeks = Math.floor(days / 7);
	  
	  if (weeks > 0) {
	    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
	  } else if (days > 0) {
	    return `${days} day${days > 1 ? 's' : ''} ago`;
	  } else if (hours > 0) {
	    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	  } else if (minutes > 0) {
	    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	  } else {
	    return 'Just now';
	  }
	}

</script>

<style lang="scss">
</style>


