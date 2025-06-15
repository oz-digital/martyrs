<template>
  <Button
    :submit="toggleJoin"
    class="bg-main button-small radius-extra button"
  >
    {{ hasTicket ? 'Leave' : 'Join' }}
  </Button>
</template>

<script setup>
  import Button from "@martyrs/src/components/Button/Button.vue";
  
  import { ref } from 'vue'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as tickets from '@martyrs/src/modules/events/store/tickets.js' // replace memberships with tickets

  const emits = defineEmits(['updateTicket'])  // Rename the event to updateTicket

  const props = defineProps({
    type: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    hasTicket: {  // Change isMember to hasTicket to represent ticket state
      type: Boolean,
      required: true
    },
    targetId: {
      type: String,
      required: true
    }
  });

  const toggleJoin = async () => {  // Rename toggleFollow to toggleJoin
    if (props.hasTicket) {
      await leaveEventOrParking(props.targetId);
    } else {
      await joinEventOrParking(props.targetId);
    }
  }

  async function joinEventOrParking(targetId) {  // Renamed followPublic to joinEventOrParking
      try {
        const ticketData = {  // Renamed membershipData to ticketData
          type: props.type,
          target: targetId,
          user: props.userId
        };

        const response = await tickets.actions.create(ticketData); // Replace memberships.actions.create with tickets.actions.create
        emits('updateTicket', { ticket: response, hasTicket: true, targetId: props.targetId });  // updateMembership to updateTicket
      } catch (error) {
        console.log(error)
        throw error;
      }
  }

  async function leaveEventOrParking(targetId) {  // Renamed unfollowPublic to leaveEventOrParking
      const ticketData = {  // Renamed membershipData to ticketData
        type: props.type,
        target: targetId,
        user: props.userId
      };

      try {
        const response = await tickets.actions.delete(ticketData);  // Replace memberships.actions.delete with tickets.actions.delete
        emits('updateTicket', { ticket: response, hasTicket: false, targetId: props.targetId });  // updateMembership to updateTicket
      } catch (error) {
        console.log(error)
        throw error;
      }
  }

</script>

<style scoped>
  /* Existing styles can stay unchanged */
</style>
