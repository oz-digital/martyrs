<script setup>
	import { useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'

	import AnimatedGrid from '@martyrs/src/modules/landing/components/elements/AnimatedGrid.vue'

	const props = defineProps({
	  textData: {
	    type: Object,
	    default: () => ({
	      messages: {
	      	en: {
				    TITLE: "Smoke Weed Every Day &<b> Get A Slice Of The Pie</b>",
				    DESCRIPTION: "Earn Weeder Token and Get part of the profits of Weeder Delivery. The more tokens you have, the bigger your cut of the profits will be. So what are you waiting for?",
				    ACTION: "Open Marketplace →",
				    SUBACTION: "Sign Up To Start"
			    }
			  }
			})
		}
	})

	const { t } = useI18n(props.textData)
</script>


<template>
	<div
		id="heroGovernance" 
		class="pos-relative bg-black o-hidden t-white t-center pd-extra flex-column flex-center flex"
	>
		<div class="sheen h-5r mn-b-small radius-extra o-hidden pos-relative ">
	  	<img loading="lazy" :src="(FILE_SERVER_URL || '') + '/logo/token.svg'" class="w-100 h-100">
	  </div>

		<h1 
			class="w-max-50r mn-b-medium" 
			v-html="t('TITLE')"
		/>

		<p 
			class="w-max-50r mn-b-big t-transp p-medium" 
			v-html="t('DESCRIPTION')"
		/>

		<div 
			class="t-white gap-thin z-index-1 cols-2"
		>
			<router-link 
				:to="{
					name: 'Sign In'
				}"
				class="w-100 bg-light t-dark br-light button"
			>
				{{t('SUBACTION')}}
			</router-link>

			<router-link  
				:to="{
					name: 'Marketplace'
				}"
				class="w-100 bg-dark t-white button"
			>
				{{t('ACTION')}}
			</router-link>
		</div>

		<AnimatedGrid class="w-100 h-100 pos-absolute pos-t-0 pos-r-0 z-index-0" />

	</div>
</template>

<style lang="scss">
	.sheen:after {
		content:'';
	  top:0;
	  left: -25%;
		transform:translateX(100%);
		width:100%;
		height:220px;
		position: absolute;
		z-index:1;
		animation: slide 3s infinite;
		 
	  /* 
	  CSS Gradient - complete browser support from http://www.colorzilla.com/gradient-editor/ 
	  */
	  background: -moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(128,186,232,0) 99%, rgba(125,185,232,0) 100%); /* FF3.6+ */
		background: -webkit-gradient(linear, left top, right top, color-stop(0%,rgba(255,255,255,0)), color-stop(50%,rgba(255,255,255,0.8)), color-stop(99%,rgba(128,186,232,0)), color-stop(100%,rgba(125,185,232,0))); /* Chrome,Safari4+ */
		background: -webkit-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* Chrome10+,Safari5.1+ */
		background: -o-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* Opera 11.10+ */
		background: -ms-linear-gradient(left, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* IE10+ */
		background: linear-gradient(to right, rgba(255,255,255,0) 0%,rgba(255,255,255,0.8) 50%,rgba(128,186,232,0) 99%,rgba(125,185,232,0) 100%); /* W3C */
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#007db9e8',GradientType=1 ); /* IE6-9 */
	}

	@keyframes slide {
		0% {	
			transform:translateX(-00%); 
			opacity: 0;
		}
		20% {
			opacity: 1
		}
		80% {
			opacity: 1
		}
		100% {
			transform:translateX(100%); 
				opacity: 0
		}
	}
</style>