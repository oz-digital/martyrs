<script setup>
import { defineProps, computed } from 'vue';
import TaskStatusBadge from './TaskStatusBadge.vue';
import { IconOpenLink, IconCheck } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  entityType: {
    type: String,
    required: true,
    validator: (value) => ['initiative', 'milestone', 'task'].includes(value)
  },
  entityData: {
    type: Object,
    required: true
  }
});

const entityConfig = {
  initiative: {
    icon: 'target',
    label: 'Initiative',
    path: (id) => ({ name: 'Initiative', params: { id } }),
  },
  milestone: {
    icon: 'layers',
    label: 'Milestone',
    path: (id) => ({ name: 'Milestone', params: { id } }),
  },
  task: {
    icon: 'checksquare',
    label: 'Task',
    path: (id) => ({ name: 'Task', params: { id } }),
  },
};

const config = computed(() => entityConfig[props.entityType]);
const displayName = computed(() => props.entityData.title || props.entityData.name || 'Untitled');
const routePath = computed(() => config.value.path(props.entityData.id));
</script>

<template>
  <router-link
    :to="routePath"
    class="d-block bg-light radius-medium pd-medium br-1px br-light hover-br-main hover-bg-main-small transition-cubic-in-out"
  >
    <div class="flex flex-justify-between flex-v-start">
      <div class="flex flex-v-start gap-small flex-child-1">
        <div class="bg-white radius-medium pd-thin hover-bg-main-small transition-cubic-in-out">
          <svg v-if="config.icon === 'target'" class="w-5r h-5r t-grey hover-t-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <svg v-else-if="config.icon === 'layers'" class="w-5r h-5r t-grey hover-t-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          <svg v-else class="w-5r h-5r t-grey hover-t-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div class="flex-child-1 min-w-0">
          <div class="p-micro t-grey mn-b-micro">{{ config.label }}</div>
          <h4 class="p-small t-medium mn-b-thin t-truncate">{{ displayName }}</h4>
          <TaskStatusBadge :status="entityData.status" />
        </div>
      </div>
      <IconOpenLink class="i-small flex-shrink-0 mn-l-thin" :fill="'rgb(var(--grey))'" />
    </div>
  </router-link>
</template>
