<template>
  <Button
    :submit="toggleMembership"
    :showSucces="false"
    class="bg-main  button-small button"
  >
  {{ !status ? props.text.create : props.text.remove }}
</Button>
</template>

<script setup>
  import Button from "@martyrs/src/components/Button/Button.vue";
  
  import { ref } from 'vue'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as memberships from '@martyrs/src/modules/organizations/store/memberships.js'

  const emits = defineEmits(['updateMembership'])

  const props = defineProps({
    user: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: false
    },
    target: {
      type: String,
      required: true
    },
    text: {
      type: Object,
      default: {
        create: 'join',
        remove: 'leave'
      }
    },
    status: {
      type: Boolean,
      required: true
    }
  });

  const toggleMembership = async () => {
    if (!props.status) {
      await createMembership();
    } else {
      await removeMembership();
    }
  }

  async function createMembership() {
    try {
      const membershipData = {
        user: props.user,
        type: props.type,
        role: props.role,
        target: props.target
      };

      const response = await memberships.actions.create(membershipData);

      emits('updateMembership', { 
        membership: response, 
        target: props.target, 
        status: true,
      });
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async function removeMembership(targetId) {
    const membershipData = {
      user: props.user,
      type: props.type,
      role: props.role,
      target: props.target
    };

    try {
      const response = await memberships.actions.delete(membershipData);

      emits('updateMembership', {
        membership: response, 
        target: props.target, 
        status: false,
      });
    } catch (error) {
      console.log(error)
      throw error;
   }
 }
</script>