<template>
  <div>
    <p class="mn-b-thin t-transp p-regular">{{ text }}</p> 

    <section class="cols-1 mn-b-small radius-medium pd-semi bg-light pos-relative">
      <div
        v-for="(member, index) in members" 
        :key="index" 
        class="br-1px br-solid br-grey-transp-25 flex gap-thin radius-small mn-b-thin"
      >
        <Field 
          v-model:field="member.contact"   
          placeholder="Enter email or phone" 
          class="w-100 pd-small radius-small bg-white"
          :validation="contactValidation"
        >
          <div 
            v-if="index < 1" 
            @click="() => members.push({contact: ''})"  
            class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-green"
          >
            <IconAdd 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>

          <div 
            v-else 
            @click="() => members.splice(index, 1)" 
            class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-red"
          >
            <IconDelete 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>
        </Field>
      </div>
    </section>

    <Button  
      :submit="submitMembers" 
      class="w-100 bg-main"
    >
      <span>Send invitations</span>
    </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';

const props = defineProps({
  organization: Object,
  text: {
    type: String,
    default: 'Please enter email or phone number to send an invitation link:'
  }
});

const emit = defineEmits(['send-invite']);

// Validation
const contactValidation = ref(null);

// Members list
const members = ref([{ contact: '' }]);

async function submitMembers() {
  return new Promise((resolve, reject) => {
    emit('send-invite', members.value, resolve, reject);
  });
}
</script>