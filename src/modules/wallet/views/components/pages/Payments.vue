<template>
  <div class="pd-thin">

    <SectionPageTitle
      title="Payments"
      @update:tabs_current="(update) => tab = update"
      :tabs_current="tab"
      :tabs="[
        { name: 'All',        value: 'all' },
        { name: 'Created',   value: 'created' },
        { name: 'Proccesing',  value: 'processing' },
        { name: 'Finished',  value: 'finished' },
        { name: 'Canceled',  value: 'canceled' },
        { name: 'Refunded',  value: 'refunded' },
      ]"
      :actions="[
        { to: { name: 'PaymentsCreate'}, label: 'Create Payment' }
      ]"
      class="mn-b-small bg-light bg-light radius-big"
    />

    <Feed
      :search="true"
      :states="{
        empty: {
          title: 'No Payments Found',
          description: 'Currently, there are no payments.'
        }
      }"
      :store="{
        read: (options) => payments.actions.read(options)
      }"
      :options="{
        limit: 15,
        owner: route.params._id,
        ...(tab !== 'all' && { type: tab })
      }"
      v-slot="{ 
        items 
      }"
      class="gap-thin cols-3 mobile:cols-1"
    >
      <div
        v-for="payment in items" 
         class="bg-light pos-relative pd-medium radius-big"
      >
        {{payment}}
      </div>
    </Feed>


</div>
</template>


<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'

import * as payments from '@martyrs/src/modules/wallet/views/store/payments.store';  

const route = useRoute();
const router = useRouter();

const tab = ref('all')
</script>


<style lang="scss">

.round-stat {
  padding: 1rem;
  border-radius: 5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.1);

  &-tab {
    width: 2rem;
    height: 2rem;
  }
}



.order-card {
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 8px 8px -8px rgb(36 36 36 / 10%);
  .order-status {
    color: black;
    background: #EEF2F6; 
    width: 100%;
    padding: 0.75rem 1.5rem;
    margin: 0;
  }

  .new {
    color: white;
    background: #00ff88;
  }

  .block {
    border-radius: 0;
    border: 0;
  }
}

  
</style>
