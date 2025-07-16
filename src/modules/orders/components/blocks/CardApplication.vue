<template>
  <div class="bg-light pos-relative pd-medium radius-medium">
    <div class="mn-b-small flex">
      <div class="mn-r-auto">
        <h3 class="mn-b-thin">{{ application.contacts?.name || application.contacts?.email || application.contacts?.phone || 'Unnamed Application' }}</h3>
        <p class="t-transp">{{ application.contacts?.email || application.contacts?.phone }}</p>
      </div>
      <div class="flex-center">
        <StatusBadge :value="{
          text: application.status,
          color: application.status === 'completed' ? '#22c55e' : application.status === 'in_progress' ? '#f59e0b' : '#6b7280'
        }" />
      </div>
    </div>

    <div class="mn-b-small pd-small bg-white radius-small flex-nowrap flex"> 
      <div class="w-100">
        <p class="t-truncate">{{ application.type || 'Unknown' }}</p> 
        <small class="t-transp">Type</small>
      </div>

      <div class="w-100 t-right">
        <p>{{ formatDate(application.updatedAt) }}</p>
        <small class="t-transp">Updated</small>
      </div>
    </div>

    <div class="pd-small bg-white radius-small">
      <div class="flex mn-b-thin">
        <div class="mn-r-auto">
          <p>{{ application.contacts?.phone || 'No phone' }}</p>
          <small class="t-transp">Phone</small>
        </div>
        <div class="t-right">
          <p>#{{ application._id.slice(0, 4) + '...' + application._id.slice(-4) }}</p>
          <small class="t-transp">ID</small>
        </div>
      </div>

      <div v-if="application.text" class="mn-t-thin">
        <p class="t-small">{{ application.text.length > 100 ? application.text.slice(0, 100) + '...' : application.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue';

  defineProps({
    application: {
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