<template>
	<div class="bg-white pd-medium">
		
		<!-- --------------------------------------------------------------- -->
		<!-- ДОБАВИТЬ СЮДА ДРОПДАУН С ВЫБОРОМ ОРГАНИЗАЦИИ ПОЛЬЗОВАТЕЛЯ -->
		<!-- --------------------------------------------------------------- -->
		<Menu 
			class="bg-light mn-b-semi"
		>
			<MenuItem 
				v-if="hasAccess(route.params._id, 'members', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Organization Members', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer"
		  >
		  	<IconGroups class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Members
		    </span>
		  </MenuItem>

		  <!-- <MenuItem 
		  	@click="router.push({
		  		name: 'Backoffice Community', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		    <span>
		    	Community
		    </span>
		  </MenuItem> -->

		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'products', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Organization_Products', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconProducts class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Products
		    </span>
		  </MenuItem>

		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'products', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Categories', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconProducts class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Categories
		    </span>
		  </MenuItem>

		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'inventory', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'OrganizationInventoryList', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconLeftovers class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Inventory
		    </span>
		  </MenuItem>

		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'orders', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'OrganizationOrdersList', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconOrders class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Orders
		    </span>
		  </MenuItem>

		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'orders', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Organization_Rents', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconOrders class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Rents
		    </span>
		  </MenuItem>


		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'gallery', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Backoffice Gallery', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconGallery class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Gallery
		    </span>
		  </MenuItem>
		  
		  <MenuItem 
		  	v-if="hasAccess(route.params._id, 'events', 'read', auth.state.accesses, auth.state.access.roles)"
		  	@click="router.push({
		  		name: 'Organization_Events Backoffice', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		  	<IconEvents class="i-medium" :icon="true" :fill="'rgb(var(--white))'"/> 
		    <span>
		    	Events
		    </span>
		  </MenuItem>

		 <!--  <MenuItem 
		  	@click="router.push({
		  		name: 'Payments', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		    <span>
		    	Payments
		    </span>
		  </MenuItem> -->
		</Menu>

		<!-- <Menu 
			class="bg-light"
		>
			<MenuItem 
		  	@click="router.push({
		  		name: 'Backoffice Organizations', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		    <span>
		    	Organizations
		    </span>
		  </MenuItem>

		  <MenuItem 
		  	@click="router.push({
		  		name: 'Backoffice Reports', 
		  		params: {
		  			_id: route.params._id
		  		}
		  	})" 
		  	class="cursor-pointer">
		    <span>
		    	Reports
		    </span>
		  </MenuItem>
		</Menu> -->
	</div>
</template>

<script setup="props">
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
import { ref, onMounted } from 'vue';

// Mobile Module
import Menu from '@martyrs/src/components/Menu/Menu.vue'
import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'
import SelectMulti    from '@martyrs/src/components/SelectMulti/SelectMulti.vue'

import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue'
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue'
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue'
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue'
import IconGallery from '@martyrs/src/modules/icons/entities/IconGallery.vue'
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue'
import IconLeftovers from '@martyrs/src/modules/icons/entities/IconLeftovers.vue'
/////////////////////////////
// HELPERS
/////////////////////////////
import { useRoute, useRouter } from 'vue-router'

import * as auth  from '@martyrs/src/modules/auth/views/store/auth.js'

import * as organizations  from '@martyrs/src/modules/organizations/store/organizations.js'

const route = useRoute()
const router = useRouter()
/////////////////////////////
// CREATED
/////////////////////////////
const props = defineProps({
  favorites: Array,
});

const selectedOrganization = ref(null);
const publics = ref([]);
/////////////////////////////
// MOUNTED
/////////////////////////////
onMounted(async () =>{
})
</script>

<style lang="scss">
</style>