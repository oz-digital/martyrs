<template>
  <Block class="pos-relative mn-b-thin">
    <BlockSearch 
      v-click-outside="() => {searchUserShow = false}" 
      v-if="!dataCustomer.user"
      @search="(event) => { searchUser = event; searchUserShow = true }"
      placeholder="Enter name, phone or email"
      class="bg-white"
    />
    <CardUser
      v-else
      :user="dataCustomer.user"
      :photo="dataCustomer.user.profile.photo"
      :name="dataCustomer.user.profile.name || dataCustomer.user.phone || dataCustomer.user.email"
      @click="() => { 
        dataCustomer.user = null
      }"
      class="bg-white h-2r pd-thin radius-medium w-100"
    />

    <div 
      v-if="searchUser && searchUserShow && !dataCustomer.user " 
      class="mn-t-thin pos-absolute w-100 pos-t-100 pos-l-0 z-index-3 bg-light pd-small radius-small
    ">
      <Feed
        :states="{
          empty: {
            title: 'No User Found',
            description: 'Currently, there are no such user.'
          }
        }"
        :store="{
          read: (options) => users.actions.read(options),
          state: null
        }"
        :options="{
          search: searchUser
        }"
        :showLoadMore="false"
        v-slot="{ 
          items 
        }"
        class="h-max-20r o-scroll"
      >
        <CardUser
          v-for="(user, index) in items" :key="user._id"
          :user="user"
          :photo="user.profile.photo"
          :name="user.profile.name || user.phone || user.email"
          @click="() => { 
            dataCustomer.user = user
            dataCustomer.profile = user.profile
            dataCustomer.phone = user.phone
            dataCustomer.email = user.email
            dataCustomer.socials = user.socials
          }"
          class="bg-white h-2r pd-thin radius-medium w-100 mn-b-thin"
        />
      </Feed>
    </div>
  </Block>

  <FormCustomerDetails
    :customer="dataCustomer"  
    class="mn-b-thin bg-light"
  />

  <Button 
    :submit="addCustomer"
    :callback="callbackCustomer"
    @error="setError"
    class="w-100 pd-small radius-big bg-main t-black uppercase t-medium"
  >
    Add Customer 
  </Button>
</template>

<script setup>
import { ref } from "vue"
import { useRoute, useRouter } from 'vue-router'

import Block from '@martyrs/src/components/Block/Block.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Button from '@martyrs/src/components/Button/Button.vue'

import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

import FormCustomerDetails from '@martyrs/src/modules/orders/components/sections/FormCustomerDetails.vue'

import * as users from '@martyrs/src/modules/auth/views/store/users.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

import { setError } from '@martyrs/src/modules/globals/views/store/globals.js'

import customers from '@martyrs/src/modules/orders/store/customers.store';
import customerInitState from "@martyrs/src/modules/orders/store/models/customer.js"

import clickOutside from '@martyrs/src/components/FieldPhone/click-outside.js';

// Directives
let vClickOutside = clickOutside
// Props
const props = defineProps({
  order: Object,
});
// Emits
const emits = defineEmits(['callbackCustomer']);
// Router
const route = useRoute()

let dataCustomer = ref(customerInitState)

let searchUser = ref(null)
let searchUserShow = ref(false)

async function addCustomer() {
  let customerData = {
    identity: {
      type: dataCustomer.value.user ? 'User' : 'Visitor',
      target: dataCustomer.value.user ? dataCustomer.value.user._id : null
    },
    owner: {
      type: 'Organization',
      target: route.params._id
    },
    creator: {
      type: 'User',
      target: auth.state.user._id
    },
    phone: dataCustomer.value.phone,
    email: dataCustomer.value.email,
    profile: dataCustomer.value.profile,
    socials: dataCustomer.value.socials
  }

  try { 
    let customer = await customers.create(customerData)
    
    dataCustomer.value = customer
  } catch(err) {
    console.log(err)
  }
}

function callbackCustomer() {
  emits('callbackCustomer', dataCustomer.value)
}
</script>