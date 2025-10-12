<template>
  <div class="mobile:pd-thin pd-medium"> 
    <SectionPageTitle
      v-if="!MOBILE_APP"
      title="Orders"
      :actions="[
        route.meta.context === 'backoffice' && { to: { name: 'BackofficeAdminCreateOrder' }, label: 'Create Order' },
        route.meta.context === 'organization' && { to: { name: 'OrganizationAdminCreateOrder', params: { _id: route.params._id}}, label: 'Create Order' }
      ].filter(Boolean)"
      class="mn-b-small"
    />

    <Block
      v-if="route.meta.context !== 'user'"
      title="Balance"
      class="mn-b-small"
    >
      <div class="gap-micro flex-nowrap flex">
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">Total</p>
          <h3>{{formatPrice(totalPrice)}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">Paid</p>
          <h3>{{formatPrice(totalPriceUnpaid)}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">Unpaid</p>
          <h3>{{formatPrice(totalPrice)}}</h3>
        </div>
      </div>

    </Block>

    <Feed
      :search="true"
      :states="{
        empty: {
          title: 'No Orders Found',
          description: 'Currently, there are no orders.'
        }
      }"
      :store="{
        read: (options) => orders.actions.read(options)
      }"
      :options="{
        limit: 15,
        ...(route.meta.context === 'organization' && { owner: route.params._id }),
        ...(route.meta.context === 'user' && { customer: route.params._id }),
        ...(tab !== 'all' && { status: tab })
      }"
      v-slot="{ 
        items 
      }"
      class="gap-thin cols-3 mobile:cols-1"
    >
      <router-link 
        v-if="route.meta.context !== 'user'"
        v-for="order in items" 
        :to="{ 
          name: route.meta.context === 'backoffice' ? 'BackofficeOrderEdit' : 'OrganizationOrderEdit', 
          params: route.meta.context === 'backoffice' 
            ? { order: order._id } 
            : { order: order._id, organization: order.owner.target || order.owner._id  }
        }" 
      >
        <CardOrderBackoffice 
          :order="order"
          :user="auth.state.user"
          :formatDate="formatDate"
          :getTotal="orders.getters.getTotal"
          :currency="returnCurrency()"
        />
      </router-link>

      <router-link 
        v-if="route.meta.context === 'user'"
        v-for="order in items" 
        :to="{ 
          name: 'UserOrder', 
          params: { 
            order: order._id 
          }
        }" 
      >
      <CardOrderUser
        :orderId="order._id"
        :status="order.status"
        :createdAt="order.createdAt"
        :updatedAt="order.updatedAt"
        :positions="order.positions"
        :total="orders.getters.getTotal(order.positions)"
      />
      </router-link>
    </Feed>
  </div>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import Tab      from '@martyrs/src/components/Tab/Tab.vue'
  import Block from '@martyrs/src/components/Block/Block.vue';

  import * as orders from '@martyrs/src/modules/orders/store/orders.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

  import CardOrder from '@martyrs/src/modules/orders/components/blocks/CardOrder.vue'

  import CardOrderUser from '@martyrs/src/modules/orders/components/blocks/CardOrderUser.vue'
  import CardOrderBackoffice from '@martyrs/src/modules/orders/components/blocks/CardOrderBackoffice.vue'

  import SectionPageTitle from '@martyrs/src/modules/core/views/components/sections/SectionPageTitle.vue'

  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import IconTime  from '@martyrs/src/modules/icons/entities/IconTime.vue'
  import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js'

  const route = useRoute();
  const router = useRouter();
  const { returnCurrency, formatPrice, formatDate } = useGlobalMixins()

  const spoiler = ref(false)

  // Tab logic
  const tab = ref('all')

  const totalPrice = computed(() => {
    return calculateTotalSum(orders.state.all)
  });

   const totalPriceUnpaid = computed(() => {
    return calculateSum(orders.state.all,'unpaid')
  });

  
  function calculateTotalSum(orders) {
    return orders.reduce((totalSum, item) => {
      return totalSum + item.positions.reduce((sum, position) => sum + position.price, 0);
    }, 0);
  }

  function calculateSum(orders, status) {
    return orders.reduce((totalSum, item) => {
      if (item.payment.status === status) {
        return totalSum + item.positions.reduce((sum, position) => sum + position.price, 0);
      }
      return totalSum;
    }, 0);
  }


  onMounted(async () => {
   
  });
</script>
