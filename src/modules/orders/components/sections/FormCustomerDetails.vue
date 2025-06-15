<template>
  <Block :title="title" class="mn-b-thin">
    <Field 
      v-model:field="customer.profile.name"   
      label="Name"  
      placeholder="Enter name"  
      class="bg-white pd-small radius-small mn-b-thin"
    />
    <FieldPhone
      v-model="customer.phone"  
      @country="(country) => { customer.number = country }"
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
    <div 
      class="gap-thin flex-justify-between flex-nowrap flex"
    >
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
        v-model:field="customer.socials[messengerSelected]"     
        label="@"  
        placeholder="Enter username"
        class="bg-white pd-small radius-small w-100"
      />
    </div>
  </Block>
</template>

<script setup>
import { ref } from "vue"
import Block from '@martyrs/src/components/Block/Block.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import FieldPhone from '@martyrs/src/components/FieldPhone/FieldPhone.vue'
import Select from '@martyrs/src/components/Select/Select.vue'

let messengerSelected = ref({name: 'WhatsApp', value: 'whatsapp'})

defineProps({
  customer: Object,
  title: {
    type: String,
    default: 'Personal Data'
  }, 
});
</script>