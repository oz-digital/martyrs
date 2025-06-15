<template>
	<div class="pd-thin">
		<header class="mn-b-medium flex-v-center flex-nowrap flex">
	      	<h2 class="mn-r-medium">Likes</h2>
		</header>

		<Tab 
			v-model:selected="tabOrganization"
			:tabs="[
				{ name: 'My posts', 	value: 'posts' },
				{ name: 'Following', 	value: 'hubs' },	
			]"
			class="mn-r-medium o-hidden h5 radius-big bg-light"
		/>

		<Feed 
			v-if="tabOrganization === 'posts'"
	  		:user="route.params._id"
			:owner="route.params._id"
		/>
	</div>
</template>

<script setup>
	import { watch, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Components
	import Tab  		from '@martyrs/src/components/Tab/Tab.vue'
	import Feed from '@martyrs/src/modules/community/components/sections/Feed.vue'; 
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