<template>
	<header 
		class="pos-sticky w-100 z-index-3 flex-center flex t-center pd-medium"
	>
		<transition name="slideIn"  mode="out-in">
			<svg 
				v-if="!route.meta.title_hide"
				@click="handleBackNavigation()" 
				class="pos-absolute cursor-pointer i-semi pos-l-medium"
				width="12"
				height="22"
				viewBox="0 0 12 22"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path fill="rgb(var(--main))" d="M9.70312 20.7969C10.125 21.2188 10.8281 21.2188 11.2969 20.7969C11.7188 20.375 11.7188 19.6719 11.2969 19.2031L3.42188 11L11.2969 2.79688C11.7188 2.32813 11.7188 1.625 11.2969 1.20313C10.8281 0.734377 10.125 0.781252 9.70312 1.20313L1.07812 10.2031C0.84375 10.4375 0.75 10.7188 0.75 11C0.75 11.2813 0.84375 11.5625 1.07812 11.7969L9.70312 20.7969Z" />
			</svg>
		</transition>

		<transition name="slideIn"  mode="out-in">
			<div :key="route.meta.title" class="header-title">
				<component
					v-if="props.logotype && route.meta.title_hide"
				  :is="props.logotype"
				  :theme="theme"
				/>

				<p v-else class="t-semi h-2r lh-semi h4 d-block" >
					{{ formateText(globals.state.navigation_bar.name || route.meta?.title?.[locale.toLowerCase()] || route.name) }}
				</p>
			</div>
		</transition>

		<div class="flex-nowrap flex gap-regular pos-absolute pos-r-medium">
			<transition name="slideIn"  mode="out-in">
				<Button
					v-if="route.meta.title_hide || route.meta.showShopCart"
					:submit="a => shopcart.actions.toggleShopcart()" 
					:counter="shopcart.getters.cartTotalAmount" 
					:showSucces="false"
					:showLoader="false"
					class="cursor-pointer pd-zero "
					> 
					<IconShopcart class="i-semi" fill="rgb(var(--main))" />
				</Button>
			</transition>

	    <transition-group v-if="actions.length > 0" name="slideIn" class="i-semi" tag="div">
	      <template v-for="(item, index) in actions" :key="index">
	        <component
						v-if="typeof item.condition === 'function' ? item.condition(router, route) : item.condition"
	          :is="item.component"
	          v-bind="item.props"
	          @click="item.action(router, route)"
	          class="i-semi cursor-pointer "
	        />
	      </template>
	    </transition-group>

			<transition name="slideIn"  mode="out-in">
				<IconProfile 
					v-if="route.meta.title_hide"
					@click="handleToggle()" 
					class="cursor-pointer i-semi"
					fill="rgb(var(--main))" 
				/>
			</transition>
		</div>
	</header>
</template>

<script setup>
	import { ref, onMounted, onUnmounted, computed } from 'vue' 
	import { useRoute, useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	
  import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue'
	import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue'

	import Button 				from '@martyrs/src/components/Button/Button.vue'

	import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
	import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js'
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

		// Props
	const props = defineProps({
    theme: {
    	type: String,
	    default: "light"
    },
    logotype: {
	    type: Object
	  }
  });

	const router = useRouter()
	const route = useRoute()

	const { t, mergeLocaleMessage, locale } = useI18n();

	const actions = computed(() => globals.state.navigation_bar.actions || route.meta?.actions || [])

	function handleBackNavigation() {
	    if (route.query?.afterAuth)  { 
	    	router.push({name: 'Home'}) 
	    } else {
	    	router.back();
	    }
	}

	function handleToggle() {
		if (auth.state.access.status === false) {
			router.push({name: 'Sign In'}) 
		} else {
			router.push({ name: 'User Profile', params: { _id: auth.state.user._id }})
		}
	}
</script>

<style lang="scss">
	.header-shopcart {
		position: absolute;
		right: 4.25rem;
	}

	.header-title {
		pointer-events: none;
	}

	.slideIn-enter-active,
	.slideIn-leave-active {
		transition: all  0.33s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slideIn-enter-from,
	.slideIn-leave-to {
		opacity: 0;
		transform: translateX(10px);

		span {	position: absolute; } 
	}

	.slideY-enter-active,
	.slideY-leave-active {
		transition: all  0.33s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slideY-enter-from,
	.slideY-leave-to {
		opacity: 0;
		transform: translateY(50px);

		span {	position: absolute; } 
	}
</style>