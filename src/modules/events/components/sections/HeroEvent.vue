<template>
  <section 
  	class="
	  	t-white
	  	t-center
	  	w-100 
	  	pos-relative
	  	gap-thin
	  	cols-1
	  	pos-relative
	  	h-min-20r
	  "
	 >
   	<div 
   		
   		class="pos-absolute bg-white w-100 h-100 z-index-0 bg-black"
   	>

   		<div class="bg-white-overlay z-index-1 w-100 h-100 pos-absolute pos-t-0 pos-r-0">
   		</div>
	    <img loading="lazy"  v-if="content.cover && !content.video" :src="content.cover" 	class=" object-fit-cover pos-absolute z-index-0 pos-t-0 pos-l-0 w-100 h-100">

			<video 
				v-if="content.video"
				style="object-fit: cover;" 
				ref="videoElement"  
				class="pos-absolute pos-t-0 pos-l-0 w-100 h-100" 
				preload autoplay muted loop playsinlineclass playsinline
				itemprop="video" 
				type="video/webm"
			>
				 <source :src="content.video" :type="getVideoType(content.video)" />
			</video>
	  </div>

   	<div 
   		class="
	  	o-hidden 
	  	pos-relative
	  	z-index-1
	  	pd-extra 
	  	pd-b-zero
	  	mn-r-auto mn-l-auto 
	  	t-white  t-left
	  	flex flex-justify-end flex-column
	  	o-hidden  
	  	w-100 h-100 
	  	gap-zero"
	  >
    	
    </div>
  </section>
</template>


<script setup>
	import { ref, onMounted } from 'vue'
	import { useI18n } from 'vue-i18n'

	const props = defineProps({
		content: {
			type: Object
		},
		options: {
			type: Object
		}
	})


	const videoElement = ref(null)

	var isPlaying = false;

	const targetDate = new Date(props.options.date).getTime();
	const currentDate = ref(new Date().getTime());
	const timeDifference = targetDate - currentDate.value;

	function checkAndPlayVideo() {
		if (videoElement.value) videoElement.value.onplaying = function() { isPlaying = true; };
		if (videoElement.value) videoElement.value.onpause = function() { isPlaying = false; };	
  }

  function getVideoType(videoUrl) {
    if (videoUrl.endsWith('.mp4')) {
      return 'video/mp4';
    } else if (videoUrl.endsWith('.webm')) {
      return 'video/webm';
    }
    return '';
  }

	async function playVid() {      
    if (videoElement.value?.paused && !isPlaying) {
      return videoElement.value.play();
    }
	} 

	onMounted(() => {
			checkAndPlayVideo()
			playVid()
	})

</script>

<style lang="scss" scoped>
.bg-white-overlay {
  background: linear-gradient(0deg, rgba(var(--white),1) 0%, rgba(var(--white),0) 100%);
}
</style>
