<template>
  <Block 
    title="Customer"
    class="pos-relative mn-b-thin"
    :actions="[{
      label: '+',
      function: () => openCreatePopup()
    }]"
  >
    <Card
      v-if="customer?._id"
      :photo="customer.profile?.photo"
      :title="customer.profile?.name || customer.phone || customer.email || 'Unnamed Customer'"
      :subtitle="customer.email || customer.phone"
      :action="{
        label: { is: IconCross },
        method: clearCustomer
      }"
      class="bg-white h-2r pd-thin radius-medium w-100 flex flex-v-center gap-thin"
    />
    
    <div v-else>
      <BlockSearch 
        @search="(event) => { searchUser = event }"
        placeholder="Enter name, phone or email"
        class="bg-white mn-b-thin"
      />

      <Feed
        :states="{
          empty: {
            title: 'No Customer Found',
            description: 'Currently, there are no such customer.'
          }
        }"
        :store="customers"
        :options="{
          search: searchUser,
          owner: route.params._id
        }"
        :showLoadMore="false"
        v-slot="{ items }"
        class="h-max-20r o-scroll"
      >
        <div
          v-for="customerItem in items" 
          :key="customerItem._id"
          @click="selectCustomer(customerItem)"
          class="bg-white pd-thin radius-medium w-100 mn-b-thin cursor-pointer"
        >
          <CardCustomer 
            :customer="customerItem"
            :formatDate="formatDate"
          />
        </div>
      </Feed>
    </div>
  </Block>


  <!-- Create Customer Popup -->
  <Popup 
    :isPopupOpen="showCreatePopup"
    @close-popup="closeCreatePopup"
    title="Create Customer"
    align="center right"
    class="bg-white h-min-100 w-max-50r pd-medium"
  >
    <FormCustomerDetails 
      v-model:customer="newCustomer"
      @save="saveNewCustomer"
      @cancel="closeCreatePopup"
      :create-mode="true"
    />
  </Popup>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRoute } from 'vue-router'

import Block from '@martyrs/src/components/Block/Block.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'

import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'
import Card from '@martyrs/src/modules/globals/views/components/blocks/Card.vue'
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue'
import CardCustomer from '@martyrs/src/modules/orders/components/blocks/CardCustomer.vue'
import FormCustomerDetails from '@martyrs/src/modules/orders/components/forms/FormCustomerDetails.vue'

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import customers from '@martyrs/src/modules/orders/store/customers.store';
import customerInitState from "@martyrs/src/modules/orders/store/models/customer.js"
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

const { formatDate } = useGlobalMixins();

// Props & Model
const customer = defineModel('customer', {
  type: Object,
  default: null
});

// Router
const route = useRoute()

// Reactive data
const searchUser = ref(null)
const showCreatePopup = ref(false)
const newCustomer = ref({ ...customerInitState })

// Methods
function selectCustomer(selectedCustomer) {
  customer.value = selectedCustomer
}

function clearCustomer() {
  customer.value = null
}

function openCreatePopup() {
  newCustomer.value = { ...customerInitState }
  if (route.params._id) {
    newCustomer.value.owner = {
      type: 'Organization',
      target: route.params._id
    };
  }
  newCustomer.value.creator = {
    type: 'User',
    target: auth.state.user._id
  };
  showCreatePopup.value = true
}

function closeCreatePopup() {
  showCreatePopup.value = false
  newCustomer.value = { ...customerInitState }
}

async function saveNewCustomer() {
  try {
    // Remove empty fields
    const cleanData = { ...newCustomer.value };
    if (!cleanData.email) delete cleanData.email;
    if (!cleanData.phone) delete cleanData.phone;
    if (!cleanData.notes) delete cleanData.notes;
    if (!cleanData.referral?.code) {
      if (cleanData.referral) delete cleanData.referral.code;
    }
    
    // Ensure ownership structure
    cleanData.owner = {
      type: 'Organization',
      target: route.params._id
    };
    
    cleanData.creator = {
      type: 'User',
      target: auth.state.user._id
    };

    const created = await customers.create(cleanData);
    customer.value = created;
    closeCreatePopup();
  } catch (error) {
    console.error('Error creating customer:', error);
  }
}
</script>