<script setup>
import { defineProps, computed } from 'vue';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import { IconCalendar } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  initiative: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const milestoneCount = computed(() => props.initiative.milestoneCount || 0);
const createdDate = computed(() => props.initiative.createdAt || props.initiative.date);
const coverUrl = computed(() => {
  if (!props.initiative.cover) return null;
  return typeof props.initiative.cover === 'string'
    ? props.initiative.cover
    : props.initiative.cover.url;
});
</script>

<template>
  <router-link
    :to="{ name: 'Initiative', params: { id: initiative._id || initiative.id } }"
    class="d-block"
  >
    <div class="bg-white radius-medium hover-scale-1 transition-cubic-in-out o-hidden br-1px br-light">
      <div v-if="coverUrl" class="h-12r o-hidden">
        <img
          :src="coverUrl"
          :alt="initiative.title"
          class="w-100 h-100 object-fit-cover hover-scale-2 transition-cubic-in-out"
        />
      </div>
      <div class="pd-regular">
        <div class="flex flex-justify-between flex-v-center mn-b-small">
          <TaskStatusBadge :status="initiative.status" />
          <div v-if="milestoneCount > 0" class="flex flex-v-center t-grey p-small">
            <svg class="w-4r h-4r mn-r-micro" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span>{{ milestoneCount }}</span>
          </div>
        </div>
        <h3 class="h4 t-medium mn-b-thin hover-t-main transition-cubic-in-out t-truncate">
          {{ initiative.title }}
        </h3>
        <p class="p-small t-grey mn-b-medium t-trim-2">
          {{ initiative.description }}
        </p>
        <div v-if="createdDate" class="flex flex-v-center t-grey p-micro">
          <IconCalendar class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>{{ formatDate(createdDate) }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>
