<template>
  <section id="viewpoint" class="br-b-white hero" itemscope itemtype="http://schema.org/BarOrPub">
    
    <div class="cols-2 gap-thin">
      <!-- Left col -->
      <div class="col-1 flex-justify flex-column flex o-hidden" itemprop="description">
        

        <div class="pd-big bg-main mn-b-thin  radius-medium">
	        <h1 class="mn-b-small">
	        	<span class="text-fade-in">
							<span class="text-splitted" v-html="t('viewpoint.title')"/>
						</span>
	        </h1>
	        
	        <p class="p-semi t-transp">{{ t('viewpoint.description') }}</p>
	      </div>

        <div class="pd-big bg-black t-white radius-medium">
          <p class="p-semi mn-b-small" itemprop="name">{{ t('contacts.name') }}</p>
          
          <address class="d-block mn-b-small" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
            <a :href="t('contacts.addressLink')" target="_blank" rel="noopener"> 
              <span itemprop="streetAddress">{{ t('contacts.streetAddress') }}</span>, 
              <span itemprop="addressLocality">{{ t('contacts.addressLocality') }}</span>, 
              <span itemprop="addressRegion">{{ t('contacts.addressRegion') }}</span>, 
              <span itemprop="postalCode">{{ t('contacts.postalCode') }}</span>
            </a>
          </address>
          
          <span class="d-block mn-b-small" itemprop="telephone">
            <a :href="'tel:' + t('contacts.telephone')" class="t-black">{{ t('contacts.telephone') }}</a>
          </span>

          <span class="d-block mn-b-medium" itemprop="email">
            <a :href="'mailto:' + t('contacts.email')" class="t-black">{{ t('contacts.email') }}</a>
          </span>

          <a :href="t('contacts.addressLink')" target="_blank" rel="noopener" class="button hover-scale-1 t-black bg-main">
            {{ t('contacts.seeongoogle') }}
          </a>
        </div>

			</div>
      <!-- Right col -->
      <div class="col-2 w-100 flex">
      	<div class="pos-relative radius-medium video-wrapper w-100 h-100 o-hidden">
      		<div class="video-gradient"></div>
    			<video ref="videoElement" style="object-fit: cover; position: absolute;" class="video-height" preload autoplay muted loop playsinlineclass playsinline src="/videos/farming.mp4" itemprop="video" type="video/mp4" ></video>
      	</div>
      </div>
      
    </div>
  </section>
</template>


<script setup>
	/////////////////////////////
	// COMPONENT DEPENDENCIES
	/////////////////////////////
	import { ref, onMounted } from 'vue';
	import { useI18n } from 'vue-i18n'
	
	let text = { 
		messages: {
		  "en":{
		    "viewpoint":{
		      "title":"Increase Your Earnings from Canna-Business with Weeder Farms",
		      "description":"Using Top-Tier Technology to Streamline Your Cannabis Farming Operations"
		    },
		    "contacts": {
		    	"name": "Запишитесь на бесплатную консультацию и узнайте как увеличить ваш доход на 30%",
		    	"seeongoogle": "Book a free consultation"
		    }
		  },
		  "ru":{
		    "viewpoint":{
		      "title":"Живописная Терраса и Бар с Видом на Море",
		      "description":"Откройте для себя всё лучшее, что может предложить Пхукет, в The Commune, стильном баре и террасе на пляже Карон. Насладитесь впечатляющим видом на море, попивая изысканные коктейли и пробуя превосходные блюда из нашего меню."
		    }
		  }
		}
	}

	const { t } = useI18n(text)
	/////////////////////////////
	// CREATED
	/////////////////////////////
	const videoElement = ref(null)

	var isPlaying = false;

	function	checkAndPlayVideo() {
    // Initializing values

		// On video playing toggle values
		videoElement.value.onplaying = function() {
		  isPlaying = true;
		};

		// On video pause toggle values
		videoElement.value.onpause = function() {
		  isPlaying = false;
		};	
  }

  // Play video function
	async function playVid() {      
    if (videoElement.value.paused && !isPlaying) {
      return videoElement.value.play();
    }
	} 
  
	onMounted(() => {
		checkAndPlayVideo()
		playVid()
			})
</script>

<style lang="scss">
	.video-height {
		  width: 100%;
	    min-height: 100%;
	    max-height: 45vh;
	    object-fit: cover;
	}

	@media screen and (max-width: 1024px) {
		.video-wrapper  {
			position: absolute;
			left: 0;
			top: 0;
			border-radius: 0 !important; 

			.video-gradient {
				position: absolute;
				pointer-events: none;
				top: 7px;
				left: 0;
				width: 100%;
				height: 100%;

				background: linear-gradient(to bottom, transparent, rgba(var(--white),1));
				z-index: 1;
			}
		}

		#viewpoint {
			.cols-2 {
		    .col-1 {
		     	order: 2;
		     	border: 0;
		    }

		    .col-2 {
		      order: 1;
		      min-height: 33vh
		    }
		  }
	  }
	}
</style>

