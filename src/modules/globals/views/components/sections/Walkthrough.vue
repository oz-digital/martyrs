<template>
	<div class="pos-fixed pos-t-0 pos-l-0 w-100 h-100vh z-index-6 bg-light flex embla" ref="emblaNode">
    <div class="w-100 embla__container z-index-1">
      <div
        v-for="(slide, index) in walkthrough"
        :key="index"
        class="flex-center pd-thin t-center flex-column flex embla__slide"
        :style="{ opacity: tweenSlides.length ? tweenSlides[index] : undefined, transform: tweenSlides[index] ? `scale(${tweenSlides[index]})` : '' }"
      >
        <img loading="lazy" class="w-100" :src="require(`@/assets/images/walkthrough/walkthrough_${index}.png`).default">
      	<h2 class="mn-b-small">{{slide.title}}</h2>
      	<p class="p-semi t-transp">{{slide.subtitle}}</p>
      </div>

      <div
      	class="flex-center flex-column flex pd-big embla__slide"
      >
      	<img loading="lazy" 
      		:src="'/logo/logo_square.svg'" 
      		class="i-extra radius-medium mn-b-small"
      	>
      	<h2 class="t-center mn-b-small">Welcome to The&nbsp;Commune</h2>
      	<p class="p-medium t-transp mn-b-semi mn-r-auto mn-l-auto t-center">Join our community to connect, share, and learn from the best. Discover new opportunities and grow with us!</p>
    
      	<button @click="openFirstRoute('Sign Up')" class="w-100 bg-main button mn-b-thin">Sign Up</button> 
      	<button @click="openFirstRoute('Sign In')" class="w-100 bg-white button mn-b-semi">Sign In</button>

	      <p class="p-medium text-center">Or explore as a guest:</p> 
      	<button @click="setFirstUseFalse()" class="button bg-white w-100">Continue without registration</button>
	    </div>

    </div>
    
    <!-- <WavesBackground
	    :style="{ transform: tweenValues[0] ? `translateX(${tweenValues[0]}%)` : '' }"
    	class="pos-fixed pos-t-0 pos-l-0 z-index-0"
    /> -->
    <!-- <ColorsBackground 
	    :style="{ transform: tweenValues[0] ? `translateX(${tweenValues[0]}%)` : '' }"
    	class="pos-fixed pos-t-0 pos-l-0 z-index-0"
    /> -->
    
    <div class="z-index-5 h-4r pos-absolute pos-b-1r pd-small flex-nowrap flex flex-center gap-small w-100 embla__dots">
	    <div
	      v-for="(snap, index) in scrollSnaps"
	      :key="index"
	      @click="scrollTo(index)"
	      :class="[
	        'embla__dot i-small radius-extra br-solid br-main br-2px',
					{ 'bg-light': index !== selectedIndex },
	        { 'bg-main': index === selectedIndex }
	      ]"
	    >
		  </div>

		  <div @click.native="setFirstUseFalse()" class="h-100 w-6r pos-b-0r flex-nowrap flex flex-center pos-r-1r pos-relative radius-small br-solid br-main br-2px uppercase t-semi p-semi t-main pos-absolute"> 
		  	skip
		  </div>
	  </div>
	</div>

</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { useRoute, useRouter } from 'vue-router'

	import emblaCarouselVue from 'embla-carousel-vue'; // Assuming a Vue version exists

	// import WavesBackground from '@/components/icons/backgrounds/WavesBackground.vue'
	// import ColorsBackground from '@/components/icons/backgrounds/ColorsBackground.vue'

	const props = defineProps(['slides', 'options']);
	const emits = defineEmits(['updateFirstUse'])
	const router = useRouter()

	// Set firstUse
	import { Preferences } from '@capacitor/preferences';

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
	// Set Slider
	let walkthrough = [{
		title: 'Communicate',
		subtitle: 'Write posts, comments and put likes.'
	},{
		title: 'Party & Fun',
		subtitle: 'Check the calendar for new events.'
	},{
		title: 'Discover',
		subtitle: 'Browse the gallery of photos.'
	}]

	const [emblaNode, emblaApi] = emblaCarouselVue({ loop: false })

	const selectedIndex = ref(0);
	const scrollSnaps = ref([]);
	const TWEEN_FACTOR = 3
	const tweenValues = ref([])
	const tweenSlides = ref([])

	const scrollTo = (index) => emblaApi.value && emblaApi.value.scrollTo(index);

	const onInit = (embla) => {
	  scrollSnaps.value = emblaApi.value.scrollSnapList();
	};

	const onSelect = (embla) => {
	  selectedIndex.value = emblaApi.value.selectedScrollSnap();
	};

	const onScroll = (embla) => {
    const engine = emblaApi.value.internalEngine()
    const scrollProgress = emblaApi.value.scrollProgress()

    const stylesOpacity = emblaApi.value.scrollSnapList().map((scrollSnap, index) => {
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

		tweenSlides.value = stylesOpacity

    const styles = emblaApi.value.scrollSnapList().map((scrollSnap, index) => {
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

    tweenValues.value = styles
  }


	onMounted(async() => {
	  onInit(emblaApi);
	  onSelect(emblaApi);
	  onScroll(emblaApi);

	  emblaApi.value.on('reInit', onInit);
	  emblaApi.value.on('reInit', onSelect);
	  emblaApi.value.on('select', onSelect);
	  emblaApi.value.on('scroll', onScroll)
	});
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
