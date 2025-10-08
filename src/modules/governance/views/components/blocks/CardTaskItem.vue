<script setup>
import { defineProps, computed } from 'vue';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import { IconCalendar, IconSend } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  task: {
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

const priorityConfig = {
  low: 'br-l-green',
  medium: 'br-l-yellow',
  high: 'br-l-red',
};

const borderColor = computed(() => priorityConfig[props.task.priority] || priorityConfig.medium);
</script>

<template>
  <router-link
    :to="{ name: 'Task', params: { id: task._id || task.id } }"
    class="d-block"
  >
    <div :class="`bg-white radius-medium hover-scale-1 transition-cubic-in-out pd-medium br-l br-3px ${borderColor} cursor-pointer`">
      <div class="flex flex-justify-between flex-v-start mn-b-small">
        <h4 class="p-regular t-medium flex-child-1 mn-r-thin">{{ task.title || task.name }}</h4>
        <IconSend v-if="task.votingId" class="i-small flex-shrink-0" :fill="'rgb(var(--main))'" />
      </div>

      <div class="mn-b-small">
        <TaskStatusBadge :status="task.status" />
      </div>

      <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-micro mn-b-small">
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="pd-micro pd-x-thin bg-light t-grey p-micro radius-small"
        >
          {{ tag }}
        </span>
      </div>

      <div class="flex flex-justify-between flex-v-center">
        <div v-if="task.dueDate" class="flex flex-v-center p-micro t-grey">
          <IconCalendar class="i-small mn-r-micro" :fill="'currentColor'" />
          <span>{{ formatDate(task.dueDate) }}</span>
        </div>
        <img
          v-if="task.assignee"
          :src="task.assignee.avatar"
          :alt="task.assignee.name"
          :title="task.assignee.name"
          class="i-medium radius-extra br-2px br-white"
        />
      </div>
    </div>
  </router-link>
</template>

