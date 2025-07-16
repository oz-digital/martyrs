<template>
  <div class="gap-small cols-1">
    <Block title="Customer Information">
      <div class="gap-small">
        <div class="flex">
          <strong class="mn-r-auto">Name:</strong>
          <span>{{ customer.profile?.name || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Email:</strong>
          <span>{{ customer.email || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Phone:</strong>
          <span>{{ customer.phone || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Status:</strong>
          <StatusBadge :value="{
            text: customer.status,
            color: customer.status === 'active' ? '#22c55e' : customer.status === 'inactive' ? '#f59e0b' : '#ef4444'
          }" />
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Source:</strong>
          <span>{{ customer.source || 'Unknown' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Type:</strong>
          <span>{{ customer.identity?.type || 'Visitor' }}</span>
        </div>
      </div>
    </Block>

    <Block title="Additional Information">
      <div class="gap-small">
        <div v-if="customer.referral?.code" class="flex">
          <strong class="mn-r-auto">Referral Code:</strong>
          <span>{{ customer.referral.code }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Created:</strong>
          <span>{{ formatDate(customer.createdAt) }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Last Activity:</strong>
          <span>{{ formatDate(customer.lastActivity || customer.updatedAt) }}</span>
        </div>
        <div v-if="customer.tags && customer.tags.length > 0">
          <strong>Tags:</strong>
          <div class="flex flex-wrap gap-nano mn-t-thin">
            <span 
              v-for="tag in customer.tags" 
              :key="tag"
              class="bg-light pd-nano radius-small t-small"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div v-if="customer.notes">
          <strong>Notes:</strong>
          <p class="mn-t-thin">{{ customer.notes }}</p>
        </div>
      </div>
    </Block>

    <div class="gap-thin flex mn-t-small">
      <Button 
        @click="$emit('edit')"
        class="w-100 pd-small radius-big bg-main t-black uppercase t-medium"
      >
        Edit
      </Button>
      <Button 
        @click="$emit('delete')"
        class="w-100 pd-small radius-big bg-danger t-white uppercase t-medium"
      >
        Delete
      </Button>
    </div>
  </div>
</template>

<script setup>
import Block from '@martyrs/src/components/Block/Block.vue';
import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

const { formatDate } = useGlobalMixins();

defineProps({
  customer: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'delete']);
</script>

<style scoped>
.bg-danger {
  background-color: #ef4444;
}
</style>