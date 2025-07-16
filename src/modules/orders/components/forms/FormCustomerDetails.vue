<template>
  <Block :title="title" class="mn-b-thin">
    <Field 
      v-model:field="customer.profile.name"   
      label="Name"  
      placeholder="Enter name"  
      class="bg-white pd-small radius-small mn-b-thin"
    />
    <Field 
      v-model:field="customer.email"   
      label="Email"  
      placeholder="Enter email"  
      type="email"
      class="bg-white pd-small radius-small mn-b-thin"
    />
    <FieldPhone
      v-model="customer.number"  
      @country="(country) => { customer.phone = country }"
      :inputOptions="{
        placeholder: 'Enter phone number',
        type: 'tel',
      }"
      :defaultCountry="'TH'"
      :validCharactersOnly="true"
      :dropdownOptions="{
        showDialCodeInSelection: true,
        showFlags: true,
        showDialCodeInList: true
      }" 
      mode="national"
      class="w-100 bg-white pd-small mn-b-thin radius-small" 
    />
    
    <Select 
      :select="sourceSelected"
      :options="[
        {name: 'Web', value: 'web'}, 
        {name: 'Mobile', value: 'mobile'}, 
        {name: 'API', value: 'api'},
        {name: 'Import', value: 'import'},
        {name: 'Manual', value: 'manual'},
        {name: 'Referral', value: 'referral'},
        {name: 'Social', value: 'social'},
        {name: 'Email', value: 'email'}
      ]"
      @update:select="(option) => { customer.source = option.value; sourceSelected = option }"
      placeholder="Source" 
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <Field 
      v-model:field="customer.referral.code"   
      label="Referral Code"  
      placeholder="Enter referral code"  
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <Field 
      v-model:field="customer.notes"   
      label="Notes"  
      placeholder="Enter notes"  
      type="textarea"
      class="bg-white pd-small radius-small mn-b-thin"
    />

    <Select 
      :select="statusSelected"
      :options="[
        {name: 'Active', value: 'active'}, 
        {name: 'Inactive', value: 'inactive'}, 
        {name: 'Blocked', value: 'blocked'}
      ]"
      @update:select="(option) => { customer.status = option.value; statusSelected = option }"
      placeholder="Status" 
      class="bg-white pd-small radius-small mn-b-thin"
    />
    
    <div class="gap-thin flex-justify-between flex-nowrap flex">
      <Select 
        :select="messengerSelected"
        :options="[
          {name: 'Instagram', value: 'instagram'}, 
          {name: 'Telegram', value: 'telegram'}, 
          {name: 'WhatsApp', value: 'whatsapp'},
        ]"
        @update:select="(option) => messengerSelected = option"
        placeholder="Messenger" 
        size="small"
        class="bg-white  pd-small radius-small"
      />
      <Field
        v-model:field="customer.socials[messengerSelected.value]"     
        label="@"  
        placeholder="Enter username"
        class="bg-white pd-small radius-small w-100"
      />
    </div>

    <div class="gap-thin flex mn-t-small">
      <Button 
        @click="handleSave"
        class="w-100 pd-small radius-big bg-main t-black uppercase t-medium"
      >
        {{ createMode ? 'Create Customer' : 'Save Changes' }}
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
import FieldPhone from '@martyrs/src/components/FieldPhone/FieldPhone.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import Button from '@martyrs/src/components/Button/Button.vue'

const customer = defineModel('customer', { required: true })

let messengerSelected = ref({name: 'WhatsApp', value: 'whatsapp'})
let sourceSelected = ref({name: 'Web', value: 'web'})
let statusSelected = ref({name: 'Active', value: 'active'})

defineProps({
  title: {
    type: String,
    default: 'Personal Data'
  }, 
  createMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'cancel']);

// Ensure nested objects exist
watch(customer, (newCustomer) => {
  if (newCustomer) {
    if (!newCustomer.profile) {
      newCustomer.profile = { name: null, description: null, photo: null };
    }
    if (!newCustomer.referral) {
      newCustomer.referral = { code: null, source: null };
    }
    if (!newCustomer.socials) {
      newCustomer.socials = { instagram: null, telegram: null, whatsapp: null };
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