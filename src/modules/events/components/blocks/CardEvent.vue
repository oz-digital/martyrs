<template>
  <article
	  class="pos-relative"
  >

    <CardHeader
	    class="mn-b-small pd-medium"
	    :entity="event"
	    :entityType="'event'"
	    :user="user"
	    :owner="event.owner"
    	:creator="event.creator"
    	:members="event.numberOfTickets"
    	:membersPhotos="event.participantsPhotos"
    	:type="'normal'"
    	:dateFormatted="daysUntilEvent"
    	:actions="actions"
    />

 		<div
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
    	class="pd-t-small  h-100 pd-medium pos-relative w-100"
    >
      
			<h4
      	class="mn-b-regular t-trim"
      >
    		{{ event.name }}
    	</h4>


    	<p
    		class="mn-b-medium p-regular t-trim-3"
    	>
    		{{ event.description }}
    	</p>

      <slot></slot>
<!-- 
      <div v-if="event.status === 'draft'" class="pd-micro t-white uppercase t-semi p-small flex-center flex pd-r-small pd-l-small mn-l-thin w-min bg-second radius-extra">
				{{event.status}}
			</div> -->

      <div
      	class="flex-wrap mn-micro-negative flex-child-default gap-thin t-zero justify-start align-center t-trim-2"
      >
       	<span
       		v-if="event.date?.start"
          :key="index"
          class="d-inline-flex mn-nano pd-thin radius-small p-regular t-medium bg-white"
        >
          {{ formattedDate }} | {{ formattedTimeRange }}
        </span>

        <span
          v-for="(chip, index) in event.tags"
          :key="index"
          class="d-inline-flex mn-nano pd-thin radius-small p-regular t-medium bg-main"
        >
          {{ chip }}
        </span>
      </div>
		<!-- <CardFooter
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

	import CardHeader  from '@martyrs/src/modules/core/views/components/blocks/CardHeader.vue'
	import CardFooter  from '@martyrs/src/modules/core/views/components/blocks/CardFooter.vue'
	import { ref, computed } from 'vue'
	import { useRouter } from 'vue-router'

	const date_now = ref(new Date())

	const router = useRouter()
	const props = defineProps(['event', 'user', 'actions'])

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
