<script setup>
	import { ref, onMounted } from 'vue'

	import FieldBig from "@martyrs/src/components/FieldBig/FieldBig.vue";
	import Shader from "@martyrs/src/components/Shader/Shader.vue";

	import { useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'

	import * as products from '@martyrs/src/modules/products/store/products.js';

	const router = useRouter()

	const text = {
    messages: {
      "en": {
		    "title": "Increase Your High <br><b class='t-main'>Boosted by AI Budtender</b>",
		    "description": "Just tell us what you're want, and Weeder will find your ideal match.",
		    "placeholderTexts": [
		    	'Lowest THC, please!',
		    	'Something with banana flavors?',
		    	"I'm in the mood for trippy vibes."
		    ],
		    "subdescription": "AI Curated Recommendations for Your Mood:",
		    "presets": {
		      "sleep": "sleep",
		      "creative": "creative",
		      "giggly": "giggly",
		      "libido": "libido",
		      "trippy": "trippy",
		      "euphoric": "euphoric"
		    },
		    "placeholder": "Tell us what you're after...",
		    "action": "Transmit"
		  },
		  "ru": {
		    "title": "Персональный Накур,<br><b class='t-main'>Напрямую от AI</b>",
		    "description": "AI на страже твоего релакса, бро. Мы подбираем самые космические товары с учетом твоего желаемого настроения:",
		    "placeholderTexts": [
		    	'Я хочу самый низкий THC',
		    	'Я хочу чего-нибудь бананового',
		    	'Я хочу курнуть хейза'
		    ],
		   	 "presets": {
		      "sleep": "сон",
		      "creative": "креатив",
		      "giggly": "смех",
		      "libido": "либидо",
		      "trippy": "трип",
		      "euphoric": "кайф"
		    },
		    "subdescription": "Или выберите тег, и наш AI направит тебя к самым крутым вариантам:",
		    "placeholder": "Опиши свой желаемый хай, bro...",
		    "action": "Передать"
		  }
		}	
	}

	const { t, rt } = useI18n(text)

	let mood = ref('')

	const presets = ['sleep','creative','giggly','libido','trippy','euphoric'];

	async function submitMood(presetMood = null) {
		const moodToSend = presetMood || mood.value;
		await products.actions.submitMood(moodToSend);
	}

	
</script>

<template>
	<div 
		class="pd-big bg-black t-white pos-relative o-hidden "
	>
		<div class="flex-column flex-center flex t-center pos-relative z-index-1">
			
			<h1 
				class="mn-b-semi" 
				v-html="t('title')"
			/>

			<p 
				class="mn-b-big p-semi t-transp" 
				v-html="t('description')"
			/>
			
			<FieldBig 
				:input="mood" 
		    :typingSpeed="100"
		    :loopTyping="true"
		    :enableTyping="true"
		    :placeholder="t('placeholder')"
		    :action="t('action')"
		    @update:input="mood = $event"
		    @action="router.push({name: 'Product Recommmendation', query: {mood: mood}})"
				class="mn-b-big pd-big bg-dark-transp-50 bg-blur-thin w-100 w-max-40r"
			/>

			<p 
				class="w-m-60r t-transp mn-b-semi p-medium" 
				v-html="t('subdescription')"
			/>

			<div style="max-width: 50rem;" class="w-100 h-max gap-thin cols-6">

				<button 
					v-for="(preset,index) in presets" 
					:key="preset" 
					@click.stop="router.push({name: 'ProductRecommmendation', query: {mood: preset}})"
					class="
						uppercase 
						pd-thin
						t-medium
						flex-center
						flex-column
						flex-nowrap
						flex
						bg-dark-transp-50 
						bg-blur-thin
						radius-semi
						cursor-pointer
						transition-elastic
						hover-easeInOut-1 
					"
				>
					<img loading="lazy" 
						:src="(FILE_SERVER_URL || '') + '/icons/moods/' + preset + '.svg'" 
						class="w-100"
					/>

					<span class="t-white"> 
						{{ t(`presets.` + preset) }}
					</span>
				</button>

			</div>

		</div>

		<!-- <Shader class="w-100 h-100 flex flex-center pos-absolute pos-t-0 pos-r-0 z-index-0"/> -->

    <!-- <div class="w-100 h-100 flex flex-center pos-absolute pos-t-0 pos-r-0 z-index-0">
  	  <img src="/spiral.webp" loading="lazy" alt="" class="spiral"/>
    </div> -->

	</div>
</template>

<style style="scoped">
.spiral {
  object-fit: cover;
  width: 100rem;
  height: 100rem;
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0.066;
  transform: translate(-50%, -50%) rotate(0deg);
  transform-origin: center center;
  animation: spin 5s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>