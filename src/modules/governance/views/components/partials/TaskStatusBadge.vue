<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const statusConfig = {
  proposed: { label: 'Proposed', color: 'bg-light' },
  voting: { label: 'Voting', color: 'bg-main-small t-main' },
  not_started: { label: 'Not Started', color: 'bg-fourth-small t-fourth' },
  in_progress: { label: 'In Progress', color: 'bg-second-small t-second' },
  review: { label: 'Review', color: 'bg-fifth-small t-fifth' },
  completed: { label: 'Completed', color: 'bg-green-nice t-white' },
  blocked: { label: 'Blocked', color: 'bg-red-nice t-white' },
  cancelled: { label: 'Cancelled', color: 'bg-grey t-white' },
  draft: { label: 'Draft', color: 'bg-light' },
  active: { label: 'Active', color: 'bg-green-nice t-white' },
  archived: { label: 'Archived', color: 'bg-grey t-white' },
  approved: { label: 'Approved', color: 'bg-green-nice t-white' },
  pending: { label: 'Pending', color: 'bg-fourth-small t-fourth' },
  rejected: { label: 'Rejected', color: 'bg-red-nice t-white' },
};

const config = computed(() => statusConfig[props.status] || statusConfig.proposed);
</script>

<template>
  <span :class="`pd-micro pd-x-small radius-regular p-micro t-medium ${config.color}`">
    {{ config.label }}
  </span>
</template>
