<template>
	<div class="pd-thin">
		<header class="mn-b-medium flex-v-center flex-nowrap flex">
    	<h2 class="mn-r-medium">Posts</h2>
    	<button 
    		v-if="auth.state.user._id === route.params._id"
    		@click="$router.push({
    			name: 'Create BlogPost'
    		})" 
    		class="radius-100 t-white t-semi i-big hover-scale-1 cursor-pointer t-white bg-second">
    			+
    	</button>
		</header>

		<Tab 
			v-if="auth.state.user._id === route.params._id"
			v-model:selected="tabOrganization"
			:tabs="[
				{ name: 'My posts', 	value: 'posts' },
				{ name: 'Drafts', 		value: 'drafts' },
				{ name: 'Following', 	value: 'following' },	
			]"
			class="mn-b-small o-hidden h5 radius-big bg-light"
		/>

		<Feed
			:showLoadMore="false"
			:states="{
				empty: {
					title: 'No Blog Posts Found',
					description: 'Currently, there are no posts available in this blog. Please check back later.'
				},
			}"
			:store="{
				read: (options) => blog.read(options)
			}"
			:options="{
				limit: 15,
				category: route.params.category,
				period: route.query.period,
				status: tabOrganization === 'drafts' ? 'draft' : 'published',
				user: auth.state.user._id,
				creator: ['posts', 'drafts'].includes(tabOrganization) ? route.params._id : null,
				following: tabOrganization === 'following' ? auth.state.user._id : null,
			}"
			v-slot="{ items }"
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
	</div>
</template>

<script setup>
	import { watch, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Components
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'

	import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue';

	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
	// Accessing router
	const route = useRoute()
	const router = useRouter()
	// State
	let tab = route.query.tab ? route.query.tab : 'posts';

	const tabOrganization = ref(tab)

	route.query.tab = tabOrganization.value

	watch(tabOrganization, (newValue) => {
	  router.replace({ query: { ...route.query, tab: newValue } });
	});
</script>