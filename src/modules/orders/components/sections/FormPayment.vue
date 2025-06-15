<template>
  <Block title="Payment">
    <div class="mn-b-small flex-nowrap flex">
      <Select 
        v-model:select="order.payment.type"
        :options="availablePaymentTypes"
        placeholder="Select type of payment" 
        size="small"
        class="bg-white pd-medium radius-small w-100"
      />
    </div>
  </Block>
</template>

<script setup>

import { computed } from 'vue';

import Block from '@martyrs/src/components/Block/Block.vue'
import Select from '@martyrs/src/components/Select/Select.vue'

const props = defineProps({
  order: Object,
  organization: Object,
});

const availablePaymentTypes = computed(() => {
  const types = new Set()
  props.organization?.spots?.forEach(spot => {
    spot.payment?.forEach(type => types.add(type))
  })
  return Array.from(types)
})



</script>