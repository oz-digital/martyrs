<script setup>
import { defineProps, computed } from 'vue';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import { IconCalendar, IconSend } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  voting: {
    type: Object,
    required: true
  }
});

const typeConfig = {
  create_task: { label: 'Create Task', color: 'bg-main-small t-main' },
  approve_task: { label: 'Approve Task', color: 'bg-green-nice t-white' },
  general: { label: 'General', color: 'bg-fifth-small t-fifth' },
};

const typeInfo = computed(() => typeConfig[props.voting.type] || typeConfig.general);
const percentageYes = computed(() =>
  props.voting.totalVotes > 0 ? (props.voting.yesVotes / props.voting.totalVotes) * 100 : 0
);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
</script>

<template>
  <router-link
    :to="{ name: 'Voting', params: { id: voting._id || voting.id } }"
    class="d-block"
  >
    <div class="bg-white radius-medium hover-scale-1 transition-cubic-in-out pd-regular br-1px br-light">
      <div class="flex flex-justify-between flex-v-start mn-b-small">
        <span :class="`pd-micro pd-x-small radius-regular p-micro t-medium ${typeInfo.color}`">
          {{ typeInfo.label }}
        </span>
        <TaskStatusBadge :status="voting.status" />
      </div>

      <h3 class="h5 t-medium mn-b-small hover-t-main transition-cubic-in-out">
        {{ voting.title }}
      </h3>

      <div class="mn-b-medium">
        <div class="w-100 bg-light radius-regular h-2r o-hidden">
          <div
            class="bg-green-nice h-100 transition-cubic-in-out"
            :style="{ width: `${percentageYes}%` }"
          />
        </div>
        <div class="flex flex-justify-between p-micro t-grey mn-t-micro">
          <span>{{ voting.yesVotes }} Yes</span>
          <span>{{ voting.noVotes }} No</span>
        </div>
      </div>

      <div class="flex flex-justify-between flex-v-center p-small">
        <div class="flex flex-v-center t-grey">
          <IconCalendar class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>{{ formatDate(voting.createdAt) }}</span>
        </div>
        <div class="flex flex-v-center t-grey">
          <IconSend class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>{{ voting.totalVotes }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

