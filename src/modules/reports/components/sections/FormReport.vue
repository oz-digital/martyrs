<template>

	<div 
		@click.native="openReportPopup()"
	>
		<slot></slot>

		<Popup 
		  @close-popup="closeReportPopup" 
		  :isPopupOpen="isReportPopup"
		  class="w-m-33r t-left pd-big bg-white radius-big"
		>
		    <h3 
		    	class="mn-b-small"
		    >
				Report Content
			</h3>
		    
		    <p 
		    	class="p-regular mn-b-small"
		    >
		    	We strive to maintain a safe and comfortable environment for all users. If you encounter content that you believe violates our guidelines, please report it:
		    </p>
		    <Select 
				v-model:select="form.reason" 
		        :options="[
		        	'harassment',
		        	'spam',
		        	'inappropriate',
		        	'misinformation',
		        	'copyright',
		        	'other'
		        ]"
		        :placeholder="'Select reason'"
				class="mn-b-small bg-white br-solid br-black-transp-10 br-1px uppercase pd-medium t-semi bg-white t-black radius-medium"
		      />
		    
		    <p class="p-regular mn-b-small">Our moderators will review your report within 24 hours and take action if it violates our policies.</p>
		    
		    <Button 
		    	:submit="onSubmit" 
		    	:callback="closeReportPopup" 
		    	class="w-100 bg-black t-white">
		    	Report
		    </Button>
		</Popup>
	</div>
</template>

<script setup="props">
	// Dependencies
	import { computed,ref,reactive } from 'vue'
	// Elements Import
	import Popup from '@martyrs/src/components/Popup/Popup.vue';
	import Button from '@martyrs/src/components/Button/Button.vue';
	import Select from '@martyrs/src/components/Select/Select.vue';
	// Store Import
	import * as reports from '@martyrs/src/modules/reports/store/reports.js'
	// ///////////////////////////////////////
 	// Components Props
 	// ///////////////////////////////////////
 	const props = defineProps({
 		user: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: false
    },
    reason: {
      type: String,
      required: false
    },
    target: {
      type: String,
      required: true
    },
	  text: {
			type: String,
			default: '!'
		},
    status: {
      type: String,
      default: 'new'
    }
 	})
 	// ///////////////////////////////////////
 	// Form Logic
 	// ///////////////////////////////////////
 	const form = reactive({
		user: props.user,
		type: props.type,
		reason: props.reason, 
		target: props.target,
		status: props.status,
	})

	function onSubmit () {
	    if (form.user === null) {
	    	delete form.user
	    }
	  	reports.actions.create(form)
	}
 	// ///////////////////////////////////////
	// Popup logic
	// ///////////////////////////////////////
	const isReportPopup = ref(false)

	function openReportPopup() {
	  isReportPopup.value = true;
	}
	function closeReportPopup() {
	  isReportPopup.value = false;
	}
</script>