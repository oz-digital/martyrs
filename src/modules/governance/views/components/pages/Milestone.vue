<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import EmptyState from '../partials/EmptyState.vue';
import CardTaskItem from '../blocks/CardTaskItem.vue';
import { mockMilestones, mockTasks } from '../../../data/mockData';
import { IconArrow, IconCalendar, IconPlus, IconCross } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();
const showTaskForm = ref(false);

const milestone = computed(() => mockMilestones.find(m => m.id === route.params.id));
const tasks = computed(() => mockTasks.filter(t => t.milestoneId === route.params.id));

const columns = [
  { id: 'proposed', title: 'Proposed', status: 'proposed' },
  { id: 'voting', title: 'Voting', status: 'voting' },
  { id: 'not_started', title: 'Not Started', status: 'not_started' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'completed', title: 'Completed', status: 'completed' },
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getTasksForColumn = (status) => {
  return tasks.value.filter(task => task.status === status);
};

const handleProposeTask = (data) => {
  console.log('Proposing task:', data);
  showTaskForm.value = false;
};
</script>

<template>
  <div v-if="!milestone" class="min-h-100vh bg-light flex flex-center flex">
    <div class="t-center">
      <h2 class="h2 t-medium mn-b-thin">Milestone not found</h2>
      <router-link :to="{ name: 'Initiatives' }" class="t-main hover-t-main-semi">
        Back to initiatives
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-100vh bg-light">
    <div class="w-max-80r mn-auto pd-medium pd-y-semi">
      <router-link
        :to="{ name: 'Initiative', params: { id: milestone.initiativeId } }"
        class="flex flex-v-center t-grey hover-t-dark mn-b-semi transition-cubic-in-out"
        style="text-decoration: none; width: fit-content;"
      >
        <IconArrow class="i-medium mn-r-thin" :rotation="180" :fill="'currentColor'" />
        Back to initiative
      </router-link>

      <div class="bg-white radius-semi o-hidden pd-semi mn-b-semi">
        <div class="flex flex-justify-between flex-v-start mn-b-semi">
          <div class="flex-child-1">
            <div class="flex flex-v-center gap-small mn-b-small">
              <TaskStatusBadge :status="milestone.status" />
              <div class="flex flex-v-center p-small t-grey">
                <IconCalendar class="i-small mn-r-micro" :fill="'currentColor'" />
                {{ formatDate(milestone.startDate) }} - {{ formatDate(milestone.dueDate) }}
              </div>
            </div>
            <h1 class="h1 t-medium mn-b-small">{{ milestone.name }}</h1>
            <p class="p-semi t-grey">{{ milestone.description }}</p>
          </div>
          <button
            @click="showTaskForm = true"
            class="bg-main hover-bg-main-semi t-white t-medium pd-small pd-x-medium radius-medium flex flex-v-center gap-thin transition-cubic-in-out mn-l-medium"
          >
            <IconPlus class="i-medium" :fill="'currentColor'" />
            Propose Task
          </button>
        </div>

        <div class="br-t br-1px br-light pd-t-semi">
          <div class="flex flex-justify-between flex-v-center mn-b-small">
            <span class="p-small t-medium t-grey">Progress</span>
            <span class="h2 t-medium">{{ milestone.progress }}%</span>
          </div>
          <div class="w-100 bg-light radius-round h-3r o-hidden">
            <div
              class="bg-main h-100 transition-cubic-in-out"
              :style="{ width: `${milestone.progress}%` }"
            />
          </div>
          <div class="mn-t-medium flex flex-v-center gap-semi p-small t-grey">
            <div class="flex flex-v-center gap-thin">
              <img
                :src="milestone.owner.avatar"
                :alt="milestone.owner.name"
                class="i-medium radius-extra"
              />
              <div>
                <div class="p-micro t-grey">Owner</div>
                <div class="t-medium">{{ milestone.owner.name }}</div>
              </div>
            </div>
            <div v-if="milestone.contributors.length > 0">
              <div class="p-micro t-grey mn-b-micro">Contributors</div>
              <div class="flex" style="margin-left: -0.25rem;">
                <img
                  v-for="contributor in milestone.contributors"
                  :key="contributor.id"
                  :src="contributor.avatar"
                  :alt="contributor.name"
                  :title="contributor.name"
                  class="i-medium radius-extra br-2px br-white"
                  style="margin-left: -0.5rem;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mn-b-semi">
        <h2 class="h2 t-medium">Tasks</h2>
      </div>

      <EmptyState
        v-if="tasks.length === 0"
        title="No tasks yet"
        message="Propose tasks to start working on this milestone."
        actionText="Propose Task"
        @action="showTaskForm = true"
      />

      <div v-else class="cols-6 gap-regular">
        <div v-for="column in columns" :key="column.id" class="bg-light radius-medium pd-medium">
          <div class="flex flex-justify-between flex-v-center mn-b-medium">
            <h3 class="t-medium">{{ column.title }}</h3>
            <span class="bg-white t-grey p-micro t-medium pd-micro pd-x-thin radius-round">
              {{ getTasksForColumn(column.status).length }}
            </span>
          </div>
          <div class="flex flex-column gap-small">
            <CardTaskItem
              v-for="task in getTasksForColumn(column.status)"
              :key="task.id"
              :task="task"
            />
          </div>
        </div>
      </div>

      <div v-if="showTaskForm" class="fixed inset-0 bg-dark-overlay flex flex-center flex z-50" @click.self="showTaskForm = false">
        <div class="bg-white radius-medium pd-semi w-max-30r">
          <div class="flex flex-justify-between flex-v-center mn-b-medium">
            <h3 class="h3 t-medium">Propose Task</h3>
            <button @click="showTaskForm = false" class="t-grey hover-t-dark transition-cubic-in-out">
              <IconCross class="i-medium" :fill="'currentColor'" />
            </button>
          </div>
          <p class="p-regular t-grey t-center">Task proposal form coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>
