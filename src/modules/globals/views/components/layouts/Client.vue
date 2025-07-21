<template>
	<div 
		id="app-wrapper"
		class="flex flex-column h-100 w-100 pos-relative o-hidden"
		:class="{
  		'pd-t-extra': MOBILE_APP === 'ios',  
			'bg-white': headerTheme === 'light',
			'bg-black': headerTheme === 'dark' 
  	}"
	>
		<transition name="moveFromTop" appear>
			<Loader v-if="!page || isPageLoading" class="pos-fixed"/>
		</transition>


	  <transition 
	    name="moveFromTop" 
	    mode="out-in"
	  >
	  	
	    <section 
	      v-if="FirstUse && route.meta.walkthrough"
	      class="w-100 h-100" 
	     >
	      <component 
	        :is="route.meta.walkthrough"
	        name="Walkthrough"
	        @updateFirstUse="updateFirstUse" 
	        :slides="[1,2,3]" 
	        class="tab"
	      >
	      </component>
	    </section>
	  </transition>

    <component
			v-if="!MOBILE_APP && route.meta.header"
      ref="header" 
      :is="route.meta.header"
      :theme="headerTheme"
      :logotype="route.meta.logotype"
      :location="route.meta.location"
    >
    	<component
		    v-if="route.meta?.header_navigation"
		    :is="route.meta.header_navigation"
		    :horizontal="true"
				:navigationItems="route.meta.header_navigation_items"
				:stateSidebar="globals.state.isOpenSidebar" 
				:theme="headerTheme"
		  />
  	</component>

		<transition name="moveFromTop" mode="out-in" appear>
			<component
       	v-if="MOBILE_APP && !route.meta.hideNavigationBar"
        :is="route.meta.navigationbar"
        :logotype="route.meta.logotype"
        :navigationItems="route.meta.sidebar_navigation_items"
	      :stateSidebar="globals.state.isOpenSidebar" 
      />
		</transition>

	  <Popup 
	  	@close-popup="closeLocationPopup" 
	  	:isPopupOpen="globals.state.isOpenLocationPopup"
	  	class="bg-white pd-semi w-m-33r radius-big"
	  >	
	  	<LocationSelection />
	  </Popup>

	  <!-- class="flex flex-nowrap transition-ease-in-out o-hidden pos-relative" -->
		<section 
			id="screen" 
			ref="screen"
			@scroll="handleScroll"
			class="flex flex-nowrap h-100 pos-relative o-hidden  transition-ease-in-out"
			:class="{
				'': MOBILE_APP === 'ios',
      }"
		>
			<ShopCart 
				:class="{
					'mobile:pd-t-extra': MOBILE_APP === 'ios',  
				}"
			/>
	    <component
	      v-if="route.meta?.sidebar"
	      v-slot="{ Component }"
	      :is="route.meta.sidebar"
	      :stateSidebar="globals.state.isOpenSidebar" 
	      :widthHidden='route.meta?.sidebar_width_hidden'
	      :width="route.meta?.sidebar_width"
	      :theme="headerTheme"
	      @closeSidebar="() => globals.state.isOpenSidebar = false"
	    >
	    	<transition name="moveFromTop"  mode="out-in">
		      <component
		        v-if="route.meta?.sidebar_navigation"
		        :is="route.meta.sidebar_navigation"
		        :key="route.meta.sidebar_navigation"
		        :navigationItems="route.meta.sidebar_navigation_items"
			      :stateSidebar="globals.state.isOpenSidebar" 
						:theme="headerTheme"
		      />
	      </transition>
	    </component>
		  <!-- rows-1-min0_max1 z-index-1 pos-relative w-100 h-100 -->
		  <div class="rows-1-min0_max1 z-index-1 pos-relative w-100 h-100">
		  	<div id="scrollview" ref="scrollview" class="o-y-scroll o-x-hidden h-100">
	  			<Status 
	  				v-if="globals.state.error.show"
						:data="globals.state.error"
						@close="globals.state.error.show = false"
						class="z-index-7" 
					/>
					<Snack 
	  				v-if="globals.state.snack.show"
						:data="globals.state.snack"
						@close="globals.state.snack.show = false"
						class="z-index-7" 
					/>
					<div class="h-min-100 pos-relative w-100">
						<!-- <section v-if="!route.meta?.breadcrumbs?.hide" class="pd-thin pd-b-zero">
							<Breadcrumbs 
								v-if="!MOBILE_APP"
								class="bg-light pd-small radius-small"
							/>
						</section> -->

				 		<Suspense @resolve="onSuspenseResolved">
							<router-view  
								id="view"
								v-slot="{ Component, route }" 
								:class="{
									'scroll-hide': MOBILE_APP,
								}"
								class="h-min-100 pos-relative w-100"
							>
								<transition @before-enter="scrollTop" name="scaleTransition" mode="out-in" appear>
					      	<component 
					      		ref="page"  
					      		:is="Component" 
					      		class="w-100 h-min-100"
				      		 	@page-loading="handlePageLoading"
			              @page-loaded="handlePageLoaded"
			              :key="componentKey"
					      	/>
					      	<!-- Key пока выключил непонятно какие проблемы это вызовет -->
					      	<!-- :key="route.path"  -->
					      </transition>
						  </router-view>
						</Suspense>
				  </div>

				 	<component 
			      v-if="route.meta.player"
			      class="z-index-2"
			    	:is="route.meta.player"
			    />
			  	<transition @before-enter="scrollTop" name="scaleTransition" mode="out-in" appear>
		        <component
							v-if="!MOBILE_APP && route.meta.footer && !route.meta.hideFooter && page && !isPageLoading"
				      ref="footer" 
				      :is="route.meta.footer"
				      :theme="headerTheme"
				      :logotype="route.meta.logotype"
				      :location="route.meta.location"
				    />
			   	</transition>
				</div>
			</div>
		</section>

		<router-view  
			name="defaultBottom"
			v-slot="{ Component, route }" 
		>
			<component 
    		:is="Component" 
    	/>
		</router-view>

	


    <component 
      v-if="MOBILE_APP && route.meta.title_hide"
      class="z-index-2"
    	:is="route.meta.bottombar"
    />
	</div>
</template>



<script setup>
	import { computed, ref, onMounted  } from 'vue';
	// Router
	import { useRoute } from 'vue-router';
	// Store
	import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
	// Partials
	import Status from '@martyrs/src/components/Status/Status.vue';
	import Snack from '@martyrs/src/components/Status/Snack.vue';
	import Popup from '@martyrs/src/components/Popup/Popup.vue';
	import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
	import Loader from '@martyrs/src/components/Loader/Loader.vue';

	import NavigationBar from '@martyrs/src/modules/globals/views/components/partials/NavigationBar.vue';
	import LocationSelection from '@martyrs/src/modules/globals/views/components/partials/LocationSelection.vue';

	import ShopCart from '@martyrs/src/modules/orders/components/partials/ShopCart.vue';
	// PROPS
	const props = defineProps({
    env: {
      type: Object,
      required: true
    },
    app: {
      type: Object,
      required: true
    },
    modules: {
      type: Object,
      required: true
    }
  })

	/////////////////////////////
  // LOADING
  /////////////////////////////
    // State
  let show = ref(false)
  // Preloader
  const page = ref(null)
   const scrollview = ref(null)

  const isPageLoading = ref(true);
  
  // Обработчики событий загрузки
  function handlePageLoading() {
    isPageLoading.value = true;
  }
  
  function handlePageLoaded() {
    isPageLoading.value = false;
  }
  
  // Обработка события разрешения Suspense (когда async setup компонента завершается)
  function onSuspenseResolved() {
    // Если страница не отправляет событие page-loaded, этот обработчик 
    // может служить запасным вариантом для отключения лоадера
    // Можно оставить закомментированным, если все страницы будут явно вызывать handlePageLoaded
    isPageLoading.value = false;
  }
	/////////////////////////////
	// CREATED
	/////////////////////////////
	const route = useRoute()
	// const router = useRouter()
	// Ref Code
	const referalCode = ref(route.query.referalCode);
	/////////////////////////////
	// Methods
	/////////////////////////////
	function closeLocationPopup() {
	  globals.state.isOpenLocationPopup = false;
	}
	function scrollTop(){
		if (scrollview.value) scrollview.value.scrollTop = 0;
	}
	// Scrolling header
	const scrollOffset = ref(0)
	let isScrolled = false
	const header = ref(null)

	const headerTheme = computed(() => {
		if (scrollOffset.value > 50) {
			return route.meta.header_theme  || 'light'
		} else {
			return route.meta.header_theme || 'light'
		}
	})

	const handleScroll = () => {
	  scrollOffset.value = event.target.scrollTop
	};
/////////////////////////////
  // FIRST USE
  /////////////////////////////
  const FirstUse = ref(false);

  import { Preferences } from '@capacitor/preferences';

  async function getFirstUse() {
    const ret = await Preferences.get({ key: 'first-use' });
    FirstUse.value = ret.value ? JSON.parse(ret.value) : true;
  }

  const updateFirstUse = (value) => {
    FirstUse.value = value;
  }

	onMounted(async () => {
	  await getFirstUse()

		// Регистрация единого Service Worker (PWA + push notifications)
		if ('serviceWorker' in navigator && !window.__MOBILE_APP__) {
	   	window.addEventListener('load', () => {
	     	navigator.serviceWorker.register('/sw.js').then(registration => {
	       	console.log('Unified SW registered: ', registration);
	     	}).catch(registrationError => {
	       	console.log('SW registration failed: ', registrationError);
	     	});
	   });
	 	}
		
		const savedPosition = localStorage.getItem('position');

	  if (savedPosition) {
	    globals.state.position = JSON.parse(savedPosition);
	  } else if (route.meta.location) {
  		globals.state.isOpenLocationPopup = true;
	  } else {
	  	globals.state.isOpenLocationPopup = false;
	  }

		if (referalCode.value) {
		  localStorage.setItem('referalCode', referalCode.value);
		}

		if (page.value) show.value = true
	});

	const componentKey = computed(() => {
	  // Собираем только значимые параметры (ID сущностей)
	  const significantParams = ['_id', 'product', 'organization', 'categoryPath']
	    .map(param => route.params[param])
	    .filter(Boolean)
	    .join('-');
	  
	  return significantParams || route.name;
	});
</script>

<style lang="scss">
	.fade-enter-active, .fade-leave-active {
	  transition: opacity .5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active в версии 2.1.8+ */ {
	  opacity: 0;
	}

	
  .fade-move,
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. declare enter from and leave to state */
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translate(30px, 0);
  }

  /* 3. ensure leaving items are taken out of layout flow so that moving
        animations can be calculated correctly. */
  .fade-leave-active {
    position: absolute;
  }

.moveFromTop-enter-active,
.moveFromTop-leave-active {
  transition: all 0.3s ease, max-height 0.2s ease;
  overflow: hidden;
}

.moveFromTop-enter-from,
.moveFromTop-leave-to {
  transform: translateY(-1rem);
  opacity: 0;
  // max-height: 0;
}

.moveFromTop-enter-to,
.moveFromTop-leave-from {
  // max-height: 100vh; 
}

	.moveFromTopAbsolute-enter-active,
	.moveFromTopAbsolute-leave-active {
		transform: translateY(0);
		opacity: 1;
		transition: all 0.5s ease; 
		
	}
	.moveFromTopAbsolute-enter-from,
	.moveFromTopAbsolute-leave-to {
		position: absolute;
		transform: translateY(-1rem);
		opacity: 0;
		transition: all 0.5s ease;
	}
	.ScaleOut-enter-active,
	.ScaleOut-leave-active {
		opacity: 1;
		transform: scale(1);
		transition: all 0.3s ease; 
		
	}
	.ScaleOut-enter-from,
	.ScaleOut-leave-to {
		opacity: 0;
		transform: scale(0.9);
		transition: all 0.3s ease;
	}
	.slide-fade-enter-active {
		// min-height: 100vh;
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide-fade-leave-active {
		// min-height: 100vh;
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		min-height: 0;
	  transform: translateX(20px);
	  opacity: 0;
	  left: 0;
	  top: 0;
	}

	.scaleTransition-5px-enter-active,
  .scaleTransition-5px-leave-active {
    transform: translateY(0px);  
    opacity: 1;
    z-index: 1;
    transition: all 0.2s ease;
  }

  .scaleTransition-5px-enter-from,
  .scaleTransition-5px-leave-to {
    opacity: 0;
    z-index: 0;
    position: absolute;
    transform: translateY(-30px); 
    transition: all 0.2s ease;
  }

  .scaleTransition-enter-from,
  .scaleTransition-leave-to {
    opacity: 0;
    z-index: 0;
    position: absolute;
    width: inherit;
    height: inherit;
    display: block;
    transform: translateY(30px); 
    transition: all 0.5s ease;
  }

  .scaleTransition-enter-active,
  .scaleTransition-leave-active {
    transform: translateY(0px);  
    opacity: 1;
    z-index: 1;
    transition: all 0.5s ease;
  }
  .scaleTransition-enter-from,
  .scaleTransition-leave-to {
    opacity: 0;
    z-index: 0;
    position: absolute;
    width: inherit;
    height: inherit;
    display: block;
    transform: translateY(30px); 
    transition: all 0.5s ease;
  }

  .scaleIn-enter-active,
  .scaleIn-leave-active {
    // background: red;
    transition: all 0.5s ease;
    > section,div { transform-origin: 0 0; transform: translateZ(0px);  transition: all 0.5s ease; }
  }
  .scaleIn-enter-from,
  .scaleIn-leave-to {
    opacity: 0;
    transform: scale(0.95);
    > section,div { transform: translateZ(-30px);  transition: all 0.5s ease; }
  }
</style>