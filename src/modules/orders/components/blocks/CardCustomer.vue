<template>
  <div class="bg-light pos-relative pd-medium radius-medium">
    <div class="mn-b-small flex">
      <div class="mn-r-auto">
        <h3 class="mn-b-thin">{{ customer.profile?.name || customer.email || customer.phone || 'Unnamed Customer' }}</h3>
        <p class="t-transp">{{ customer.email || customer.phone }}</p>
      </div>
      <div class="flex-center">
        <StatusBadge :value="{
          text: customer.status,
          color: customer.status === 'active' ? '#22c55e' : customer.status === 'inactive' ? '#f59e0b' : '#ef4444'
        }" />
      </div>
    </div>

    <div class="mn-b-small pd-small bg-white radius-small flex-nowrap flex"> 
      <div class="w-100">
        <p class="t-truncate">{{ customer.source || 'Unknown' }}</p> 
        <small class="t-transp">Source</small>
      </div>

      <div class="w-100 t-right">
        <p>{{ formatDate(customer.lastActivity || customer.updatedAt) }}</p>
        <small class="t-transp">Last Activity</small>
      </div>
    </div>

    <div class="pd-small bg-white radius-small">
      <div class="flex mn-b-thin">
        <div class="mn-r-auto">
          <p>{{ customer.identity?.type || 'Visitor' }}</p>
          <small class="t-transp">Type</small>
        </div>
        <div class="t-right">
          <p>#{{ customer._id.slice(0, 4) + '...' + customer._id.slice(-4) }}</p>
          <small class="t-transp">ID</small>
        </div>
      </div>

      <div v-if="customer.tags && customer.tags.length > 0" class="flex flex-wrap gap-nano">
        <span 
          v-for="tag in customer.tags.slice(0, 3)" 
          :key="tag"
          class="bg-light pd-nano radius-small t-small"
        >
          {{ tag }}
        </span>
        <span 
          v-if="customer.tags.length > 3"
          class="bg-light-transp pd-nano radius-small t-small t-transp"
        >
          +{{ customer.tags.length - 3 }}
        </span>
      </div>

      <div v-if="customer.referral?.code" class="mn-t-thin">
        <p class="t-small">Referral: {{ customer.referral.code }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue';

  defineProps({
    customer: {
      type: Object,
      required: true
    },
    formatDate: {
      type: Function,
      required: true
    }
  });
</script>

<style scoped>
  .bg-light {
    background-color: var(--color-bg-light, #f8f9fa);
  }
  
  .bg-light-transp {
    background-color: var(--color-bg-light-transp, rgba(248, 249, 250, 0.7));
  }
  
  .bg-light-transp-50 {
    background-color: var(--color-bg-light-transp-50, rgba(248, 249, 250, 0.5));
  }
</style>