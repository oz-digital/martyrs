<template>
	<div class="o-hidden bg-light pos-relative radius-medium cols-2">
		<div style="min-height: 20rem;" :class="{'order-2':order}" class="pos-relative w-100 h-100 bg-light">
			<img loading="lazy" class="w-100 h-100 object-fit-cover pos-absolute" :src="image">
		</div>   
   <div class="pd-big flex-column flex w-100 h-100 gap-zero">
    	<h2 class="mn-b-medium">
				{{title}}
	    </h2>
	    
	    <p class="p-medium t-transp">
	    	{{description}}
	    </p>
    </div>
  </div>
</template>


<script setup>
	import { useI18n } from 'vue-i18n'

	const props = defineProps(['image','title','description','order'])

	const { t } = useI18n({ 
		messages: {
		  en:{
		    "nye2024":{
		      "title":"Delisious pizza from stone oven",
		      "description":"Join the hottest Christmas party event at NMS.IO and make your time with family and friends extra special. Enjoy festive on the celebrations with unique surprises and fun activities in NMS.IO!",
		      "checkinblog":"CHECK IN BLOG"
		    }
		  }
		}
	})
</script>

<style lang="scss">
	.order-2 {
		order: 2
	}
</style>
