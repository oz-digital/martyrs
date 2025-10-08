<template>
  <article 
	  :class="{
	  	'flex-nowrap flex-v-center flex': type === 'short',
	  	'flex flex-column': type !== 'short',
	  }"
	  class="pos-relative"
  >
  
    <CardHeader 
	    :class="{
	    	'mn-b-small pd-medium': type !== 'short',
	    	'flex-child-order-last flex-child mn-l-small': type === 'short',
	    }"
	    :entity="event"
	    :entityType="'event'"
	    :user="user"
	    :owner="event.owner" 
    	:creator="event.creator"
    	:members="event.numberOfTickets"
    	:membersPhotos="event.participantsPhotos"
    	:type="type"
    	:dateFormatted="daysUntilEvent"
    />

 		<div 
 			v-if="type !== 'short'" 
 			class="o-hidden flex-child-default pos-relative bg-black-transp-5 mn-b-small w-100"
 		>
	    <img v-if="event.cover" loading="lazy" 
	    	:src="(FILE_SERVER_URL || '') + event.cover" 
	    	alt="Event image" 
	    	class="pos-relative z-index-1 d-block mn-auto w-max-100 object-fit-contain h-20r"
	    />

	    <img v-if="event.cover"  loading="lazy" 
	    	:src="(FILE_SERVER_URL || '') + event.cover" 
	    	alt="Event Background" 
	    	class="z-index-0 pos-absolute w-100 h-100 pos-t-0 pos-r-0"
	    	style="
	    		transform: scale(1.5);
	    		filter: blur(2rem);
  				-webkit-filter: blur(2rem);"
	    />
	    <IconEvents
	    	v-else
				class="pos-relative z-index-1 d-block mn-auto w-max-100 object-fit-contain h-20r"
				fill="rgb(var(--black)"
			/>
	  </div>

    <section 
    	class="pos-relative w-100"
    	:class="{
    		'pd-t-zero h-100 flex flex-column pd-medium': type !== 'short',
    		'flex-nowrap flex flex-v-center': type === 'short'
    	}"
    >

	    <IconEdit
				v-if="user === event.creator.target._id"
				@click.stop="$router.push({
					name: 'Edit Event', 
					params: {
						url: event.url
					}
				})" 
				class="z-index-2 pos-absolute pos-t-regular pos-r-regular i-medium t-transp"
			/>

    	<div
    		:class="{
    			'mn-b-small': type !== 'short',
    			'order-2 mn-l-thin': type === 'short'
    		}"
    		class="flex-v-center flex-nowrap flex"
    	>
				 	<span 
			    	v-if="type === 'short'" 
			    	class="t-semi t-truncate uppercase"
			    >
	        	{{ event.name }}
			    </span>
			</div>

      <div v-if="type !== 'short'" class="cursor-pointer mn-b-thin flex-nowrap flex w-100">

				<h3 
	      	v-if="type !== 'short'" 
	      	class="t-trim-1"
	      >
	    		{{ event.name }}
	    	</h3>

				<div v-if="event.status === 'draft'" class="pd-micro t-white uppercase t-semi p-small flex-center flex pd-r-small pd-l-small mn-l-thin w-min bg-second radius-extra">
					{{event.status}}
				</div>
				
			</div>

    	<span 
    		v-if="type !== 'short'" 
    		class="h-100 mn-b-regular p-regular t-trim-3"
    	>
    		{{ event.description }}
    	</span>

      <slot></slot>
      
      <div 
      	class="flex-wrap mn-micro-negative flex-child-default gap-thin t-zero justify-start align-center t-trim-2"
      	:class="{
	    		'order-1': type === 'short'
    		}"
      >
       	<span
       		v-if="event.date?.start"
          :key="index"
          class="d-inline-flex p-medium t-medium mn-nano pd-thin radius-small bg-white"
          :class="{
		    		'p-regular': type === 'short'
	    		}"
        >
          {{ formattedDate }}
          <template
		    		v-if="type !== 'short'"
			    >
		        | {{ formattedTimeRange }}
			    </template>
        </span>


        <span
        	v-if="type !== 'short'"
          v-for="(chip, index) in event.tags"
          :key="index"
          class="d-inline-flex mn-nano pd-thin radius-small p-medium t-medium bg-main"
        >
          {{ chip }}
        </span>
      </div>
			<!-- <CardFooter
				v-if="type !== 'short'"  
				class="" 
				:entity="event"
				:entityType="'event'" 
				:user="user"
			/> -->

    </section>
    
    <!-- <FooterBlogpost class="pd-t-zero pd-medium" :event="event" :owner="owner"/> -->
  </article>
</template>

<script setup="props">
	import Chips  from '@martyrs/src/components/Chips/Chips.vue'

	import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'


	import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue';

	import CardHeader  from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue'
	import CardFooter  from '@martyrs/src/modules/globals/views/components/blocks/CardFooter.vue'
	import { ref, computed } from 'vue'
	import { useRouter } from 'vue-router'

	const date_now = ref(new Date())

	const router = useRouter()
	const props = defineProps(['event', 'user', 'short', 'type'])

	const firstImage = computed(() => {
		return props.event.content.find(block => block.type.name === 'ImageUpload');
	});

	const firstText = computed(() => {
		return props.event.content.find(block => block.type.name === 'Textarea');
	});

  // Function to calculate days until event
  const daysUntilEvent = computed(() => {
    const now = new Date();
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  
    const start = new Date(props.event.date.start);
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds());
  
    const diffInTime = startUTC - nowUTC;

    if (diffInTime < 0) {
      return 'Finished';
    }
    else if (diffInTime === 0) {
      return 'Starting Now';
    }
    else {
      const diffInSeconds = Math.floor(diffInTime / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) {
        return `${diffInDays} days until event`;
      }
      else if (diffInHours > 0) {
        return `${diffInHours} hours until event`;
      }
      else if (diffInMinutes > 0) {
        return `${diffInMinutes} minutes until event`;
      }
      else {
        return `${diffInSeconds} seconds until event`;
      }
    }
});


  /// Computed property for formatted date
	const formattedDate = computed(() => {
	    const start = new Date(props.event.date.start);
	    const options = { day: '2-digit', month: '2-digit' };
	    return start.toLocaleDateString(undefined, options);
	});

	// Computed property for time range
	const formattedTimeRange = computed(() => {

		console.log(props.event.date.start)
		console.log(props.event.date.end)
    const start = new Date(props.event.date.start);
    const end = new Date(props.event.date.end);

    const startTime = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
    const endTime = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(end);
    return `${startTime}-${endTime}`;
	});


	// Computed property for truncated event name
	const truncatedEventName = computed(() => {
	  const eventName = props.event.name;
	  if (eventName.length > 26) {
	    return `${eventName.substring(0, 22)}…`; // Truncate to 37 characters and append "..."
	  }
	  return eventName; // If less than or equal to 40 characters, return the full string
	});


</script>

<style lang="scss">
</style>
