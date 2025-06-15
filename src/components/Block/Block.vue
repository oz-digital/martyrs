<template>
	<div 
    class="bg-light pd-medium radius-medium"
  >
  	<div v-if="title || actions" class="mn-b-small flex-v-center flex-nowrap flex">
  		<h4 v-if="title" class="mn-r-thin t-medium">{{title}}</h4>
  			
  		<button 
  			v-for="action in actions" 
  			@click="action.function" 
  			class="pd-thin button-delete button"
  			:class="action.class || 'bg-main radius-small t-center i-medium'"
  		>
  			{{action.label}}
  		</button>

  		<Tooltip v-if="tooltip" :text="tooltip">
	      <p class="bg-main radius-small t-center i-medium">i</p>
	    </Tooltip>
  	</div>

  	<span 
      v-if="!hasSlotContent($slots.default)" 
      class="w-100"
    >
     {{placeholder}}
    </span> 

  	<slot></slot>
	</div>
</template>

<script setup>
import { ref, defineProps, useSlots, Comment } from 'vue';


import Tooltip           from '@martyrs/src/components/Tooltip/Tooltip.vue'

const slots = useSlots()

const hasSlotContent = (slot, slotProps = {}) => {
	if (!slot) return false;

	return slot(slotProps).some((vnode) => {
		if (Array.isArray(vnode.children)) {
			return !!vnode.children.length;
		}

		return vnode.type !== Comment;
	});
};

// defineProps объявление
const props = defineProps({
	title: {
		type: String,
		default: null
	},
	tooltip: {
		type: String,
		default: null
	},
	actions: {
		type: Array,
		default: null
	},
	placeholder: {
		type: String,
		default: 'Nothing here'
	},
  options: {
    type: Object,
    default: {
    	theme: 'white'
    }
  },
})
</script>