	<template>
	<div class="bg-white">
		<section class="w-100  flex-nowrap flex gap-thin mobile:pd-zero pd-thin pos-relative">

			<div style="flex: 1 1 auto" class="w-100 h-100 pos-relative">
				<header v-if="!route.params.url && route.name !== 'Create BlogPost'" class="bg-light pd-medium radius-medium mobile:radius-zero scroll-hide o-y-visible t-black pos-relative  mn-b-thin flex-v-center t-left flex-nowrap flex">
		    	<h2 class="pos-relative t-nowrap flex-v-center flex-nowrap flex">
		    		<span class="mn-r-thin">Posts for </span>

		    		<Select 
			        :options="['today','week','month','year','all time']"
			        v-model:select="blog.state.filter.period" 
			        placeholder="all time"
			        class="
			        	t-semi
			        	pos-relative 
			        	w-max
			        	bg-main t-black
			        	pd-thin
			        	radius-medium
			          h2
			         	t-center
			         	flex-column 
			         	flex 
			         	gap-regular 
			        "
			      />
		    	</h2>
				</header>

				<div  v-if="!route.params.url && route.name !=='Create BlogPost'"  class="w-100 pos-relative">
					<ul class="align-self-start pos-sticky pos-t-0 w-100 bg-light radius-medium mobile:radius-zero mn-b-thin pd-medium p-regular gap-thin flex-row flex-nowrap flex z-index-2 o-scroll t-nowrap scroll-hide">
						<li  	
							:class="{'t-black bg-white': route.params.category === 'featured' }" 					
							@click="() => { blog.state.sort.param = 'createdAt'; router.push({name: 'Blog', params: { category: 'featured' } })}" 
							class="cursor-pointer flex-v-center flex t-medium  pd-thin radius-small"
						>
							<IconFeatured class="i-medium mn-r-thin t-transp"/>
							Featured
						</li>
						<li  	
							:class="{'t-black bg-white': route.params.category === 'popular' }"					 				
							@click="() => { blog.state.sort.param = 'views'; router.push({name: 'Blog', params: { category: 'popular' } }) }" 
							class="cursor-pointer t-medium flex-v-center flex  pd-thin radius-small"
						>	
							<IconPopular class="i-medium mn-r-thin t-transp"/>
							Popular
						</li>
						<li  	
							:class="{'t-black bg-white': route.params.category === 'new'}" 					
							@click="() => { blog.state.sort.param = 'createdAt'; router.push({name: 'Blog', params: { category: 'new' } })}" 
							class="cursor-pointer t-medium flex-v-center flex  pd-thin radius-small"
						>
							<IconRecent class="i-medium mn-r-thin t-transp"/>
							Recent
						</li>
						<li 	
							v-if="auth.state.user._id"
							:class="{'t-black bg-white': route.params.category === 'following'}" 		
							@click="() => { blog.state.sort.param = 'createdAt'; router.push({name: 'Blog', params: { category: 'following' } })}" 
							class="cursor-pointer t-medium flex-v-center flex pd-thin radius-small"
						>
							<IconFollowing class="i-medium mn-r-thin t-transp"/>
							Following
						</li>

						<router-link 
							v-if="auth.state.user._id"
							:to="{
								name: 'Create BlogPost'
							}" 
							class="button t-medium bg-main w-max mn-l-auto"
						>
							Create Post
						</router-link>
					</ul>
				</div>


				<router-view v-slot="{ Component, route }">
					<transition name="scaleIn" mode="out-in">
						<component ref="page" :key="route.query" :is="Component" />
					</transition>
				</router-view>
			</div>

			<div style="flex: 1 1 auto" class="desktop-only pos-sticky pos-b-thin scroll-hide  h-100  w-40 h-100 pos-relative ">
				<div class="radius-medium bg-light mn-b-thin pd-small">
					<div class="gap-thin flex-nowrap flex">
						<p class="t-medium mn-b-small">Latest Comments</p>
					</div>

					<div class="flex flex-column gap-thin">
						<Comment
		        	v-for="comment in comments.slice(0,5)"
			        :key="comment._id"
			        :comment="comment"
			        :target="target"
			        :type="type"
			        :owner="owner"
			        @reply="handleReply"
			        @load-more="loadMoreChildren"
			        class="comment bg-white pd-small radius-regular"
			      />
			    </div>
		    </div>

	      <div class="radius-medium bg-light pd-small">
					<div class="gap-thin flex-v-center flex-nowrap flex  mn-b-small">
						<p class="text-box-trim-end t-medium">Popular Communities</p>
						
						<router-link
							v-if="auth.state.user._id"
							to="/organizations/create"
							class="t-medium cursor-pointer hover-scale-1 radius-extra flex-center flex i-medium bg-main"
						>
							+
						</router-link>
					</div>

					<transition name="slide-fade">
						<Feed
							:showLoadMore="false"
							:LoadMore="false"
				      :states="{
				        empty: {
				          title: 'No Organization Found',
				          description: 'Currently, there are no organization available.'
				        }
				      }"
				      :store="{
				        read: (options) => organizations.actions.read(options),
				        state: organizations.state
				      }"
				      :options="{
				        	user: auth.state.user._id,
									sort: 'numberOfMemberships',
									contain: ['blogposts'],
									lookup: ['blogposts'],
									limit: 10
				      }"
				      v-slot="{ 
				        items 
				      }"
				      class="flex flex-column gap-thin"
				    >
				    	<CardOrganization 
			    			v-for="organization in items"
			        	:key="organization._id" 
				      	:organization="organization"
				      	:user="auth.state.user"
				      	:showProducts="false"
				      	:showRating="false"
				      	:showFeatured="false"
				      	:showFollowers="false"
								@updateMembership="handleMembershipUpdate"
								class="pd-small w-100 pd-0 bg-white radius-regular o-hidden"
					    />
				    </Feed>
					</transition>
				</div>
			</div>

		</section>
	</div>
</template>

<script setup="props">
	import { computed,onMounted, toRefs,ref } from 'vue'
  import { useRoute,useRouter } from 'vue-router'

	import Select         from '@martyrs/src/components/Select/Select.vue'
	import Feed from '@martyrs/src/components/Feed/Feed.vue'
	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

	import IconFeatured from '@martyrs/src/modules/icons/entities/IconFeatured.vue'
	import IconPopular from '@martyrs/src/modules/icons/entities/IconPopular.vue'
	import IconRecent from '@martyrs/src/modules/icons/entities/IconRecent.vue'
	import IconFollowing from '@martyrs/src/modules/icons/entities/IconFollowing.vue'


import axios from 'axios';


import Comment from '../sections/Comment.vue';


const $axios = axios.create({ baseURL: process.env.API_URL });
const comments = ref([]);
const commentContent = ref('');

const fetchComments = async () => {
  try {
    const response = await $axios.get('/comments/read', {
      params: {
        maxDepth: 1,
        format: 'plain'
      }
    });
    comments.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

fetchComments();

// Import state
import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js'
import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'

// State
const route = useRoute();
const router = useRouter();

if (route.params.category === 'popular') blog.state.sort.param = 'views'; 
if (route.params.category === 'new') blog.state.sort.param = 'createdAt'; 


const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
  membershipsStore.handleMembershipUpdate(organizations.state.current, membership, status, target, statusName, statusNumber)
};

</script>

<style lang="scss">

</style>
