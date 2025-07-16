<template>
  <Block :title="title" class="mn-b-thin">
    <Field 
      v-model:field="application.contacts.name"   
      label="Name"  
      placeholder="Enter name"  
      class="bg-white pd-small radius-small mn-b-thin"
    />
    <Field 
      v-model:field="application.contacts.email"   
      label="Email"  
      placeholder="Enter email"  
      type="email"
      class="bg-white pd-small radius-small mn-b-thin"
    />
    <Field 
      v-model:field="application.contacts.phone"   
      label="Phone"  
      placeholder="Enter phone"  
      type="tel"
      class="bg-white pd-small radius-small mn-b-thin"
    />
    
    <Select 
      :select="typeSelected"
      :options="[
        {name: 'Newsletter', value: 'newsletter'}, 
        {name: 'Support', value: 'support'}, 
        {name: 'Inquiry', value: 'inquiry'},
        {name: 'Feedback', value: 'feedback'},
        {name: 'Other', value: 'other'}
      ]"
      @update:select="(option) => { application.type = option.value; typeSelected = option }"
      placeholder="Type" 
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <Field 
      v-model:field="application.text"   
      label="Message"  
      placeholder="Enter message"  
      type="textarea"
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <Select 
      :select="statusSelected"
      :options="[
        {name: 'Created', value: 'created'}, 
        {name: 'In Progress', value: 'in_progress'}, 
        {name: 'Completed', value: 'completed'},
        {name: 'Cancelled', value: 'cancelled'}
      ]"
      @update:select="(option) => { application.status = option.value; statusSelected = option }"
      placeholder="Status" 
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <div class="gap-thin flex mn-t-small">
      <Button 
        @click="handleSave"
        class="w-100 pd-small radius-big bg-main t-black uppercase t-medium"
      >
        {{ createMode ? 'Create Application' : 'Save Changes' }}
      </Button>
      <Button 
        @click="handleCancel"
        class="w-100 pd-small radius-big bg-light t-black uppercase t-medium"
      >
        Cancel
      </Button>
    </div>
  </Block>
</template>

<script setup>
import { ref, watch } from "vue"
import Block from '@martyrs/src/components/Block/Block.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import Button from '@martyrs/src/components/Button/Button.vue'

const application = defineModel('application', { required: true })

let typeSelected = ref({name: 'Newsletter', value: 'newsletter'})
let statusSelected = ref({name: 'Created', value: 'created'})

defineProps({
  title: {
    type: String,
    default: 'Application Data'
  }, 
  createMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'cancel']);

// Ensure nested objects exist
watch(application, (newApplication) => {
  if (newApplication) {
    if (!newApplication.contacts) {
      newApplication.contacts = { name: null, email: null, phone: null };
    }
  }
}, { immediate: true, deep: true });

const handleSave = () => {
  emit('save');
};

const handleCancel = () => {
  emit('cancel');
};
</script>