<script setup="props">
	import { computed, onMounted, toRefs, ref, inject } from 'vue'

	import { useRouter,useRoute } from 'vue-router'
	import { useI18n } from 'vue-i18n'

	import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
	import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js'
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

	const store = useStore()
	
	// Globasls Component

	import NotificationBadge from '@martyrs/src/modules/notifications/components/elements/NotificationBadge.vue';
	// import Navigation from '@martyrs/src/modules/core/views/components/partials/Navigation.vue'
	// Martyrs Component
	import Button from '@martyrs/src/components/Button/Button.vue'
	import Select from '@martyrs/src/components/Select/Select.vue'
	import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
	// Icons module
	import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue'
	import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue'
	import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';
	// Props
	const props = defineProps({
    theme: {
    	type: String,
	    default: "light"
    },
    logotype: {
	    type: Object
	  },
	  location: {
	    type: Boolean,
		  default: true
	  },
	  theme_switcher: {
	    type: Boolean,
		  default: true
	  },
  });
	// Accessing state
	const router = useRouter()
	const route = useRoute()
	// Localization
	const { t } = useI18n()
	// const search = computed(() => store.products.state.search)

	function openLocationPopup() {
	  store.core.state.isOpenLocationPopup = true;
	}
	/////////////////////////////
	// MOUNTED
	/////////////////////////////
	onMounted(() => {
    shopcart.actions.setShopcart()
  });
</script>

<template>
	<header 
		id="header" 
		class="
			pd-thin 
			gap-micro
			flex-justify-between
			flex-nowrap
			flex
			h-4r
			w-100
			z-index-2 
			pos-relative pos-t-0
			br-b
			br-solid
		"
		:class="{
  		't-black br-light': theme === 'light',
  		't-white br-dark': theme === 'dark'  
  	}"
	>
	<div class="flex-nowrap flex-v-center flex-justify-start flex gap-micro ">
		<!-- MENU -->
		<button
			aria-label="menu"
			@click="() => store.core.state.isOpenSidebar = !store.core.state.isOpenSidebar"
			class="cursor-pointer mobile-only menu-btn"
			:class="{
				'menu-btn_active': store.core.state.isOpenSidebar
			}"
		>
	    <span
	    	class="no-events"
		    :class="{
		      'bg-black': theme === 'light',
		      'bg-white': theme === 'dark'
		    }"
		  >
		    <span class="menu-btn__before" :class="{ 'bg-black': theme === 'light', 'bg-white': theme === 'dark' }"></span>
		    <span class="menu-btn__after" :class="{ 'bg-black': theme === 'light', 'bg-white': theme === 'dark' }"></span>
		  </span>
	  </button>

		<!-- LOGO -->
		<component
			v-if="logotype"
		  :is="logotype"
		  @click="router.push({ path: '/' })" 
		  :theme="theme"
		  class="cursor-pointer h-2r"
		/>

		<button
			v-if="location"
			aria-label="button_location"
    	class="
    		cursor-pointer
    		bg-transp 
    		pd-l-micro pd-r-micro
    		radius-extra 
    		uppercase 
    		t-semi
    		br-solid 
    		br-2px 
    		transition-linear
    		t-nowrap
    	
    	"
    	:class="{
    		'fill-black br-black t-black hover-bg-black hover-t-white hover-fill-white': theme === 'light',
    		'fill-white br-white t-white hover-bg-white hover-t-black hover-fill-black': theme === 'dark'  
    	}"
    	@click="openLocationPopup()"
    >
    	<svg class="i-small" :fill="'inherit'" xmlns="http://www.w3.org/2000/svg" width="50" height="67" viewBox="0 0 50 67" fill="none">
			  <path d="M25 0C11.207 0 0 11.207 0 25C0 38.793 20.832 66.668 25 66.668C29.168 66.668 50 38.793 50 25C50 11.207 38.793 0 25 0ZM25 33.332C20.418 33.332 16.668 29.582 16.668 25C16.668 20.418 20.418 16.668 25 16.668C29.582 16.668 33.332 20.418 33.332 25C33.332 29.582 29.582 33.332 25 33.332Z" :fill="'inherit'"/>
			</svg>
    	 {{store.core.state.position?.country ? store.core.state.position.country : 'World'}}
    </button>
  </div>

 	<slot></slot>

	<div class="flex-justify-end flex-v-center flex-nowrap flex gap-micro">
		<Button 
			v-if="router.hasRoute('Search') && route.meta.header_search"
			aria-label="search"
			class="pd-zero bg-transp"
			:class="route.meta.header_search_class"
			:submit="() => router.push({name: 'Search'})"
			:showSucces="false"
			:showLoader="false"
		>
			<IconSearch 
				class="i-medium"
				:fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" 
			/>
		</Button>
	
		<Button
			aria-label="shopcart"
			:submit="a => shopcart.actions.toggleShopcart()" 
			:counter="shopcart.getters.cartTotalAmount" 
			:showSucces="false"
			:showLoader="false"
			class="pd-zero mn-r-micro"
			> 
			<IconShopcart 
				class="i-medium"
				:fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" 
			/>
			<!-- <div class="w-max p-small pos-absolute pos-t-100 pos-r-0">Product Added to Shopcart</div> -->
		</Button>


		<NotificationBadge
			v-if="auth.state.user._id"
			:fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" 
		/>

		<Button 
			aria-label="profile"
			class="pd-zero bg-transp"
			:submit="
				auth.state.access.status === false 
				? 
				a => router.push({name: 'Sign In'}) 
				: 
				a => router.push({ name: 'User Profile', params: { _id: auth.state.user._id }})
			"
			:showSucces="false"
			:showLoader="false"
		>
			<IconProfile 
				class="i-medium"
				:fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" 
			/>
		</Button>

		<Select 
			v-if="$i18n.availableLocales.length > 1"
			v-model:select="$i18n.locale"
		  :options="$i18n.availableLocales"
		  :property="'value'"
      class="pos-relative flex flex-column gap-small uppercase pd-thin t-semi radius-thin"
      :class="{
    		'bg-light t-black': theme === 'light',
    		'bg-dark t-white': theme === 'dark'  
    	}"
    />
  </div>
</header>
  
</template>

<style lang="scss">
.location-button { 
	&:hover {
		box-shadow: inset 0 0 0 2px rgb(var(--main));
	}
}

.menu-btn {
  display: block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  position: relative;
}
.menu-btn span,
.menu-btn__before,
.menu-btn__after {
  position: absolute;
  top: 50%;
  margin-top: -1px;
  left: 50%;
  margin-left: -10px;
  width: 20px;
  height: 2px;
}
.menu-btn__before,
.menu-btn__after {
  display: block;
  transition: 0.2s;
}
.menu-btn__before {
  transform: translateY(-5px);
}
.menu-btn__after {
  transform: translateY(5px);
}
.menu-btn_active .menu-btn__before {
  transform: rotate(-35deg);
  width: 10px;
  transform-origin: left bottom;
}
.menu-btn_active .menu-btn__after {
  transform: rotate(35deg);
  width: 10px;
  transform-origin: left top;
}

.menu-btn_active span:before {
  transform: rotate(-35deg);
  width: 10px;
  transform-origin: left bottom;
}
.menu-btn_active span:after {
  transform: rotate(35deg);
  width: 10px;
  transform-origin: left top;
}

.menu-block {
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu-nav {
  background-color: #fff;
  height: 50px;
  
}
.menu-nav__link {
  display: inline-block;
  text-decoration: none;
  color: #fff;
  margin-right: 20px;
}
.menu-nav__link {
  transition: 0.5s;
  transform-origin: right center;
  transform: translateX(50%);
  opacity: 0;
}
.menu-nav__link_active {
  transform: translateX(0%);
  opacity: 1;
}

</style>