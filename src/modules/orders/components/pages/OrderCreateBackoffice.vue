<template>
  <div class="h-100 flex flex-column pd-thin">
    <Block class="mn-b-thin">
      <header class="flex-v-center flex-nowrap flex">
        <h2 class="mn-r-auto">Create Order</h2>
        <Button 
          :submit="onSubmit"
          :callback="redirectTo"
          class="pd-small radius-big bg-main t-black uppercase t-medium"
        >
          Add Order 
        </Button>
      </header>
    </Block>

    <Tab 
      v-model:selected="tabOrderCreate"
      :tabs="[
        {name: 'Positions', value: 'positions'},
        {name: 'Customer', value: 'customer'},
        {name: 'Delivery', value: 'delivery'},
        {name: 'Payment', value: 'payment'}
      ]"
      class="t-medium radius-medium bg-light mn-b-small"
    />

    <Popup 
      @close-popup="closeProductsPopup" 
      :isPopupOpen="isOpenProductsPopup"
      class="bg-white flex flex-column radius-big pd-medium pos-relative"
    >

      <h3 class="mn-b-small">Add to order</h3>

      <div class="bg-light h-max-100 mn-b-thin o-scroll pd-medium radius-big">
        <Feed
          :showLoadMore="false"
          :search="{
            placeholder: 'Search products...',
            class: 'bg-white mn-b-thin'
          }"
          :states="{
            empty: {
              title: 'No Products Found',
              description: 'Currently, there are no such products available.'
            },
            skeleton: {
              hide: true
            }
          }"
          :store="{
            read: (options) => products.actions.read(options),
            state: null
          }"
          :options="{
            owner: route.params._id
          }"
          v-slot="{ 
            items 
          }"
          class=""
        >
          <CardOrderItem
            v-for="(product, index) in items" :key="product._id"
            :editable="false" 
            :product="product" 
            @click="() => { 
              let p = { ...product };
              p.quantity = 1;
              globals.actions.add(orders.state.current.positions, p) 
              closeProductsPopup();
            }"
            class="bg-white pd-thin radius-medium w-100 mn-b-thin"
          />
        </Feed>
      </div>
    </Popup>

    <Block
      v-if="tabOrderCreate === 'positions'"
      title="Positions"
      :actions="[{
        label: '+',
        function: () => openProductsPopup()
      }]"
      class="mn-b-small"
    >
      <span 
        v-if="orders.state.current.positions.length === 0" 
        class="w-100"
      >
        No positions added yet
      </span> 

      <CardOrderItem
        v-for="(product, index) in orders.state.current.positions" 
        :key="product._id"
        :editable="true" 
        :product="product" 
        @increase="() => { globals.actions.increment(orders.state.current.positions, product) }"
        @decrease="() => { globals.actions.decrement(orders.state.current.positions, product) }"
        @remove="() => { globals.actions.delete(orders.state.current.positions, product) }"э
        @updateRentDates="(product, dates) => orders.mutations.updateRentDates({ positions: orders.state.current.positions, productId: product._id, dates })"
        class="mn-b-thin pd-thin radius-medium bg-white"
      /> 
    </Block>

    <Block
      v-if="tabOrderCreate === 'customer'"
      title="Customer"
      class="mn-b-semi"
      :actions="[{
        label: '+',
        function: () => openCustomerPopup()
      }]"
    >
      <CardUser
        v-if="orders.state.current.customer._id"
        :user="orders.state.current.customer"
        :photo="orders.state.current.customer.profile.photo"
        :name="orders.state.current.customer.profile.name || orders.state.current.customer.phone || orders.state.current.customer.email"
        @click="() => { 
          orders.mutations.resetCustomer(orders.state.current.customer)
        }"
        class="bg-white pd-thin h-4r radius-medium w-100 mn-b-thin"
      />
      <Feed
        v-else
        :search="{
          placeholder: 'Search customer...',
          class: 'bg-white mn-b-thin'
        }"
        :states="{
          empty: {
            title: 'No Products Found',
            description: 'Currently, there are no such products available.'
          }
        }"
        :store="{
          read: (options) => customers.read(options),
          state: null
        }"
        :options="{
          owner: route.params._id
        }"
        v-slot="{ 
          items 
        }"
        class="bg-light h-max-20r o-scroll"
      >
        <CardUser
          v-for="(user, index) in items" 
          :key="user._id"
          :user="user"
          :photo="user.profile.photo"
          :name="user.profile.name || user.phone || user.email"
          @click="() => { 
            orders.state.current.customer = user
          }"
          class="bg-white pd-thin h-4r radius-medium w-100 mn-b-thin"
        />
      </Feed>
      
    </Block>

    <FormDelivery  
      v-if="tabOrderCreate === 'delivery'" 
      :order="orders.state.current"
      :organization="orderOrganization[0]" 
    />

    <FormPayment  
      v-if="tabOrderCreate === 'payment'"
      :order="orders.state.current"  
      :organization="orderOrganization[0]" 
    />

    <Popup 
      title="Add customer" 
      @close-popup="closeCustomerPopup" 
      :isPopupOpen="isOpenCustomerPopup"
      :class="'bg-white w-min-30r w-max-30r radius-big pd-medium'"
    >
      <FormAddCustomer 
        @callbackCustomer="closeCustomerPopup"
      />
    </Popup>

    <Block
      class="mn-b-semi"
    >
      <div class="h3 flex">
        <span class="mn-r-auto t-transp">In total</span>
        <span>{{ cartTotalPrice }} {{returnCurrency()}} </span  >
      </div>
    </Block>
</div>


</template>

<script setup="props">
  import { computed, ref, defineProps, onMounted, reactive, toRefs, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'


  import Field from '@martyrs/src/components/Field/Field.vue'
  import Button from "@martyrs/src/components/Button/Button.vue";  
  import Tab from '@martyrs/src/components/Tab/Tab.vue'
  import Popup from '@martyrs/src/components/Popup/Popup.vue';
	import Block from '@martyrs/src/components/Block/Block.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardOrderItem  from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue'
  import CardPosition from '@martyrs/src/modules/products/components/blocks/CardPosition.vue';
  import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

  import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'

  import FormAddCustomer from '@martyrs/src/modules/orders/components/sections/FormAddCustomer.vue'
  import FormDelivery from '@martyrs/src/modules/orders/components/sections/FormDelivery.vue'
  import FormPayment from '@martyrs/src/modules/orders/components/sections/FormPayment.vue'

  // Import your store
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as orders from '@martyrs/src/modules/orders/store/orders.js';
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  import * as products from '@martyrs/src/modules/products/store/products.js';

  import customers from '@martyrs/src/modules/orders/store/customers.store';
	
  // Accessing router
  const route = useRoute()
  const router = useRouter()

   orders.mutations.resetOrder(orders.state.current)

  let cartTotalPrice = computed(() => {
    return Number(orders.state.current.positions.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0));
  })

  // Tab
  const tabOrderCreate = ref('positions')

  // Popup
  const isOpenProductsPopup = ref(false);

  function openProductsPopup() {
    isOpenProductsPopup.value = true;
  }

  function closeProductsPopup() {
    isOpenProductsPopup.value = false;
  }

  const isOpenCustomerPopup = ref(false);

  function openCustomerPopup() {
    isOpenCustomerPopup.value = true;
  }

  function closeCustomerPopup() {
    isOpenCustomerPopup.value = false;
  }

  // Data
  let order = ref(null)

  async function onSubmit() {

    orders.state.current.creator = {
      type: 'User',
      target: auth.state.user._id
    }

    orders.state.current.owner = {
      type: 'Organization',
      target: route.params._id,
    }

    orders.state.current.customer = {
      type: 'Customer',
      target: orders.state.current.customer._id || null,
    }

    order.value = await orders.actions.create(orders.state.current)
  }

  function redirectTo () {
    router.push({
      name: route.meta.context === 'backoffice' ? 'BackofficeOrderEdit' : 'OrganizationOrderEdit',
      params: { 
        order: order.value._id,
        _id: route.params._id
      } 
    })
  }

  const orderOrganization = ref({})



  onMounted(async() => {

    orderOrganization.value = await organizations.actions.read({
      _id: route.params._id,
      lookup: ['spots']
    })

    // await orders.actions.fetchOrder(route.params.id) // Implement this action in your store

    // order.value = orders.state.current
  })

</script>


<style lang="scss">

.vue-select {
  width: inherit;

  margin-right: 1rem;
}
.vue-select-header {
  height: 3rem;
}
</style>
