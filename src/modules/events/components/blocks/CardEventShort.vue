<template>
  <article
	  class="flex-nowrap flex-v-center flex pos-relative"
  >

    <CardHeader
	    class="flex-child-order-last flex-child mn-l-small"
	    :entity="event"
	    :entityType="'event'"
	    :user="user"
	    :owner="event.owner"
    	:creator="event.creator"
    	:members="event.numberOfTickets"
    	:membersPhotos="event.participantsPhotos"
    	:type="'short'"
    	:dateFormatted="daysUntilEvent"
    	:actions="actions"
    />

    <section
    	class="flex-nowrap flex flex-v-center pos-relative w-100"
    >
    	<div
    		class="order-2 mn-l-thin flex-v-center flex-nowrap flex"
    	>
			<span
		    	class="t-semi t-truncate uppercase"
		    >
        	{{ event.name }}
		    </span>
		</div>

      <div
      	class="order-1 flex-wrap mn-micro-negative flex-child-default gap-thin t-zero justify-start align-center t-trim-2"
      >
       	<span
       		v-if="event.date?.start"
          :key="index"
          class="p-regular d-inline-flex p-medium t-medium mn-nano pd-thin radius-small bg-white"
        >
          {{ formattedDate }}
        </span>
      </div>

    </section>

  </article>
</template>

<script setup="props">
	import CardHeader  from '@martyrs/src/modules/core/views/components/blocks/CardHeader.vue'
	import { ref, computed } from 'vue'
	import { useRouter } from 'vue-router'

	const date_now = ref(new Date())

	const router = useRouter()
	const props = defineProps(['event', 'user', 'actions'])

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

</script>

<style lang="scss">
</style>
