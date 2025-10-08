<script setup>
import { defineProps } from 'vue';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import { IconCalendar, IconCheck } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  milestone: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
</script>

<template>
  <router-link
    :to="{ name: 'Milestone', params: { id: milestone._id || milestone.id } }"
    class="d-block"
  >
    <div class="bg-white radius-medium hover-scale-1 transition-cubic-in-out pd-regular br-1px br-light">
      <div class="flex flex-justify-between flex-v-start mn-b-small">
        <h3 class="h5 t-medium flex-child-1 hover-t-main transition-cubic-in-out">
          {{ milestone.name }}
        </h3>
        <TaskStatusBadge :status="milestone.status" />
      </div>

      <div class="mn-b-medium">
        <div class="flex flex-justify-between mn-b-thin p-small">
          <span class="t-grey">Progress</span>
          <span class="t-medium">{{ milestone.progress }}%</span>
        </div>
        <div class="w-100 bg-light radius-regular h-2r o-hidden">
          <div
            class="bg-main h-100 transition-cubic-in-out"
            :style="{ width: `${milestone.progress}%` }"
          />
        </div>
      </div>

      <div class="flex flex-justify-between p-small">
        <div class="flex flex-v-center t-grey">
          <IconCalendar class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>
            {{ formatDate(milestone.startDate) }} - {{ formatDate(milestone.dueDate) }}
          </span>
        </div>
        <div class="flex flex-v-center t-grey">
          <IconCheck class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>{{ milestone.taskCount }}</span>
        </div>
      </div>

      <div class="mn-t-medium flex flex-v-center">
        <img
          :src="milestone.owner.avatar"
          :alt="milestone.owner.name"
          class="i-medium radius-extra br-2px br-white"
        />
        <span class="mn-l-thin p-small t-grey">{{ milestone.owner.name }}</span>
      </div>
    </div>
  </router-link>
</template>
