<template>
	<div class="pos-fixed  pos-t-0 pos-l-0 w-100 h-100vh z-index-6 bg-white flex embla" ref="emblaNode">
    

    <div class="embla__container w-100 z-index-1">
	    

		  <!-- SLIDE 1 -->
		  <!-- ------------------------------- -->
    	<div class="pos-relative flex-justify-center pd-thin t-center flex-column flex embla__slide">
	    		<!-- <div class="pos-absolute w-100 h-100 z-index-0 pos-t-0 pos-r-0">
	    			<div class="pos-absolute z-index-1 pos-t-0 pos-r-0 w-100 h-100 bg-black-grad"></div>
	    			<img class="pos-absolute z-index-0 pos-t-0 pos-r-0 object-fit-cover h-100 w-100" src="/assets/walkthrough/1.png">
	    		</div> -->
    		<div 
    			class="flex flex-column flex-center pd-semi o-hidden pos-relative pos-b-0 z-index-1"
    			 :style="{ opacity: tweenSlides.length ? tweenSlides[0] : undefined, transform: tweenSlides[0] ? `scale(${tweenSlides[0]})` : '' }"
    		>
    			<img 
	      		:src="'/logo/logo_square.svg'" 
	      		class="i-extra radius-medium mn-b-small"
	      	>

	        <h3 class="h3 mn-b-medium">Welcome to 3SR</h3>
	        
	        <p class="p-regular t-transp mn-b-big">
	          Access premium cameras, lenses, lighting, and audio gear through our app designed for filmmakers and content creators.
	        </p>


	        <button @click="nextSlide" class="bg-main p-big w-max button">
	          Get Started
	        </button>
	      </div>
    	</div>

    	<!-- SLIDE 2 -->
		  <!-- ------------------------------- -->
    	<div class="pos-relative flex-justify-center pd-thin t-center flex-column flex embla__slide">
				<div class="flex flex-column flex-center pd-semi o-hidden pos-relative pos-b-0 z-index-1">
          
          <div class="mn-b-small w-4r h-4r mn-auto pd-regular bg-main radius-regular t-white flex flex-center">
            <IconBell/>
          </div>

	        <h3 class="h3 mn-b-medium">Stay in the Loop</h3>
	        <p class="p-regular t-transp mn-b-big">
	          Get instant notifications about equipment availability, booking confirmations, and exclusive deals from our rental platform.
	        </p>

	        <div class="flex flex-column flex-center gap-small">
	          <button @click="requestNotificationPermission" class="bg-main p-big w-max button">
						 	 Enable Notifications
						 </button>
	          <button @click="nextSlide" class="bg-light p-big w-max button">
	            Maybe Later
	          </button>
	        </div>
	      </div>
			</div>

			<!-- SLIDE 3 -->
		  <!-- ------------------------------- -->
			<div class="pos-relative flex-justify-center pd-thin t-center flex-column flex embla__slide">
        <div class="flex flex-column flex-center pd-semi o-hidden pos-relative pos-b-0 z-index-1">
          
          <div class="mn-b-small w-4r h-4r mn-auto pd-regular bg-main radius-regular t-white flex flex-center">
            <IconAddress/>
          </div>

          <h3 class="h3 mn-b-medium">Find Nearby Equipment</h3>
          <p class="p-regular t-transp mn-b-big">
            Discover rental locations and equipment availability near you. We'll show you the closest pickup points and delivery options.
          </p>

          <div class="flex flex-column flex-center gap-small">
            <button @click="requestLocationPermission" class="bg-main p-big w-max button">
              Enable Location
            </button>
            <button @click="nextSlide" class="bg-light p-big w-max button">
              Skip for Now
            </button>
          </div>
        </div>
      </div>

      <!-- SLIDE 4 - App Tracking Transparency -->
		  <!-- ------------------------------- -->
      <div class="pos-relative flex-justify-center pd-thin t-center flex-column flex embla__slide">
        <div class="flex flex-column flex-center pd-semi o-hidden pos-relative pos-b-0 z-index-1">
          <div class="mn-b-small w-4r h-4r mn-auto pd-regular bg-main radius-regular t-white flex flex-center">
            <IconShield/>
          </div>

          <h3 class="h3 mn-b-medium">Personalized Experience</h3>
          <p class="p-regular t-transp mn-b-big">
            Allow us to provide you with personalized recommendations and improve your app experience based on your preferences.
          </p>

          <div class="flex flex-column flex-center gap-small">
            <button @click="requestTrackingPermission" class="bg-main p-big w-max button">
              Allow Tracking
            </button>
            <button @click="nextSlide" class="bg-light p-big w-max button">
              Ask App Not to Track
            </button>
          </div>
        </div>
      </div>

      <!-- SLIDE 5 - Final -->
		  <!-- ------------------------------- -->
      <div class="pos-relative flex-justify-center pd-thin t-center flex-column flex embla__slide">
      	<div class="flex flex-column flex-center pd-semi o-hidden pos-relative pos-b-0 z-index-1">
	      	<img loading="lazy" 
	      		:src="'/logo/logo_square.svg'" 
	      		class="i-extra radius-medium mn-b-small"
	      	>
	      	<h3 class="h3 mn-b-medium">Ready to Rent?</h3>
	      	<p class="p-regular t-transp mn-b-big">Join thousands of creators who trust 3SR for their professional video equipment needs. Choose how you'd like to get started.</p>
	    
	      	<button @click="openFirstRoute('Sign Up')" class="bg-main p-big w-100 button mn-b-thin">Create Account</button> 
	      	<button @click="openFirstRoute('Sign In')" class="bg-light t-black p-big w-100 button mn-b-semi">Sign In</button>

		      <p class="p-small mn-b-medium t-transp">Or explore as a guest:</p> 
	      	<button @click="setFirstUseFalse()" class="bg-light p-big w-max button">Continue as Guest</button>
      	</div>
	    </div>

    </div>

    <div class="
	    embla__dots
    	z-index-5 
    	h-4r 
    	pos-absolute 
    	pos-t-1r 
    	flex-nowrap 
    	flex 
    	flex-center 
    	gap-thin 
    	w-100"
    >
	    <button
	      v-for="(snap, index) in scrollSnaps"
	      :key="index"
	      @click="scrollTo(index)"
	      :class="[
	        'embla__dot bg- i-small radius-extra',
					{ 'bg-light': index !== selectedIndex },
	        { 'bg-main': index === selectedIndex }
	      ]"
	    >
		  </button>

		  <button 
		  	@click.native="setFirstUseFalse()" 
		  	class="
		  		pd-small
		  		bg-white
		  		t-black
		  		w-6r 
		  		pos-b-0r 
		  		flex-nowrap 
		  		flex 
		  		flex-center 
		  		pos-r-1r 
		  		pos-relative 
		  		radius-small 
		  		uppercase 
		  		pos-absolute
		  	"> 
		  	<span>Skip</span>
		  </button>
	  </div>
	</div>

</template>

<script setup>
	import { ref, onMounted, reactive, inject } from 'vue';
	import { useRoute, useRouter } from 'vue-router'

	import emblaCarouselVue from 'embla-carousel-vue'; 

	import IconBell from '@martyrs/src/modules/icons/entities/IconBell.vue';
	import IconAddress from '@martyrs/src/modules/icons/entities/IconAddress.vue';
	import IconShield from '@martyrs/src/modules/icons/entities/IconAddress.vue';

	import { AppTrackingTransparency } from 'capacitor-plugin-app-tracking-transparency';

	const props = defineProps(['slides', 'options']);
	const emits = defineEmits(['updateFirstUse'])
	const router = useRouter()
	
	// Get notification manager directly
	import ModuleNotifications from '@martyrs/src/modules/notifications/notifications.client.js'

	// Set firstUse
	import { Preferences } from '@capacitor/preferences';

	const permissions = reactive({
	  notifications: false,
	  location: false,
	  tracking: false
	})

	async function setFirstUseFalse() {
    await Preferences.set({
      key: 'first-use',
      value: JSON.stringify(false),
    });

    emits('updateFirstUse', false);
  }

  async function openFirstRoute(routeName) {
		await router.push({name: routeName})

		await Preferences.set({
      key: 'first-use',
      value: JSON.stringify(false),
    });

		emits('updateFirstUse', false);
	}

	const [emblaNode, emblaApi] = emblaCarouselVue({ loop: false })

	const selectedIndex = ref(0);
	const scrollSnaps = ref([]);
	const TWEEN_FACTOR = 3
	const tweenValues = ref([])
	const tweenSlides = ref([])

	const scrollTo = (index) => emblaApi.value && emblaApi.value.scrollTo(index);

	const nextSlide = () => {
		if (emblaApi.value) {
			emblaApi.value.scrollNext();
		}
	};

	const onInit = (embla) => {
	  scrollSnaps.value = emblaApi.value.scrollSnapList();
	};

	const onSelect = (embla) => {
	  selectedIndex.value = emblaApi.value.selectedScrollSnap();
	};

	let scrollRAF = null;
	const onScroll = (embla) => {
		// Cancel previous frame if exists
		if (scrollRAF) cancelAnimationFrame(scrollRAF);
		
		scrollRAF = requestAnimationFrame(() => {
			const engine = emblaApi.value.internalEngine()
			const scrollProgress = emblaApi.value.scrollProgress()
			// Cache snapList to avoid calling it twice
			const snapList = emblaApi.value.scrollSnapList()

			const stylesOpacity = snapList.map((scrollSnap, index) => {
				let diffToTarget = scrollSnap - scrollProgress

				if (engine.options.loop) {
					engine.slideLooper.loopPoints.forEach((loopItem) => {
						const target = loopItem.target()
						if (index === loopItem.index && target !== 0) {
							const sign = Math.sign(target)
							if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
							if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
						}
					})
				}
				const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR)
				return  Math.min(Math.max(tweenValue, 0), 1)
			})

			const styles = snapList.map((scrollSnap, index) => {
				let diffToTarget = scrollSnap - scrollProgress

				if (engine.options.loop) {
					engine.slideLooper.loopPoints.forEach((loopItem) => {
						const target = loopItem.target()
						if (index === loopItem.index && target !== 0) {
							const sign = Math.sign(target)
							if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
							if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
						}
					})
				}
				return diffToTarget * (1 / TWEEN_FACTOR) * 100
			})

			// Batch updates together
			tweenSlides.value = stylesOpacity
			tweenValues.value = styles
		});
	}


	onMounted(() => {
	  emblaApi.value.on('init', onInit)
	  emblaApi.value.on('select', onSelect)
	  emblaApi.value.on('scroll', onScroll)
	});

	const requestNotificationPermission = async () => {
	  try {
	    // Use notification manager from global store if available
	    const notificationManager = window.$store?.notificationManager;
	    
	    if (notificationManager) {
	      await notificationManager.pushHandler.requestPermissions();
	      await notificationManager.registerWebPush(window.$store);
	      permissions.notifications = true;
	    }
	    
	    setTimeout(() => {
	      nextSlide()
	    }, 1000)
	  } catch (error) {
	    console.error('Notification permission error:', error)
	    nextSlide()
	  }
	}

	const requestLocationPermission = async () => {
	  try {
	    if (!('geolocation' in navigator)) {
	      nextSlide()
	      return
	    }

	    navigator.geolocation.getCurrentPosition(
	      () => {
	        permissions.location = true
	        setTimeout(() => {
	          nextSlide()
	        }, 1000)
	      },
	      () => {
	        setTimeout(() => {
	          nextSlide()
	        }, 1000)
	      },
	      { timeout: 8000 }
	    )
	  } catch (error) {
	    console.error('Location permission error:', error)
	    nextSlide()
	  }
	}

	const requestTrackingPermission = async () => {
	  try {
	    const { status } = await AppTrackingTransparency.requestPermission();
	    
	    if (status === 'authorized') {
	      permissions.tracking = true;
	    }
	    
	    setTimeout(() => {
	      nextSlide();
	    }, 1000);
	  } catch (error) {
	    console.error('Tracking permission error:', error);
	    nextSlide();
	  }
	};

</script>

<style lang="scss">
	.embla {
    overflow: hidden;
  }
  .embla__container {
    display: flex;
  }
  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
  }
</style>
