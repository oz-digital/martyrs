<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import CardTaskItem from '../blocks/CardTaskItem.vue';
import EmptyState from '../partials/EmptyState.vue';
import { mockTasks } from '../../../data/mockData';
import { IconPlus, IconCheck, IconTime, IconShow, IconSend, IconEntityInfo } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();
const tasks = ref(mockTasks);

const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'));
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'));
const reviewTasks = computed(() => tasks.value.filter(t => t.status === 'review'));
const votingTasks = computed(() => tasks.value.filter(t => t.status === 'voting'));
const proposedTasks = computed(() => tasks.value.filter(t => t.status === 'proposed'));
const notStartedTasks = computed(() => tasks.value.filter(t => t.status === 'not_started'));
const blockedTasks = computed(() => tasks.value.filter(t => t.status === 'blocked'));
</script>

<template>
  <div>
    <div v-if="!route.params.id" class="min-h-100vh bg-light">
      <div class="w-max-66r mn-auto pd-medium pd-y-semi">
        <div class="flex flex-justify-between flex-v-center mn-b-semi">
          <div>
            <h1 class="h1 t-medium">Tasks</h1>
            <p class="p-regular t-grey mn-t-thin">View and manage all tasks across initiatives</p>
          </div>
          <router-link
            :to="{ name: 'Create Task' }"
            class="bg-main hover-bg-main-semi t-white t-medium pd-small pd-x-semi radius-medium flex flex-v-center gap-thin transition-cubic-in-out cursor-pointer"
            style="text-decoration: none;"
          >
            <IconPlus class="i-medium" :fill="'currentColor'" />
            Create Task
          </router-link>
        </div>

        <div v-if="tasks.length === 0">
          <EmptyState
            title="No tasks yet"
            message="Get started by creating your first task."
            actionText="Create Task"
            @action="$router.push({ name: 'Create Task' })"
          >
            <template #icon>
              <svg class="w-12r h-12r t-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </template>
          </EmptyState>
        </div>

        <div v-else class="flex flex-column gap-semi">
          <div v-if="completedTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <svg class="w-5r h-5r fill-green-nice" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h3 class="h4 t-medium">Completed</h3>
              <span class="p-small t-grey">({{ completedTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in completedTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="inProgressTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <IconTime class="i-medium" :fill="'rgb(var(--second))'" />
              <h3 class="h4 t-medium">In Progress</h3>
              <span class="p-small t-grey">({{ inProgressTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in inProgressTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="reviewTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <IconShow class="i-medium" :fill="'rgb(var(--fifth))'" />
              <h3 class="h4 t-medium">Review</h3>
              <span class="p-small t-grey">({{ reviewTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in reviewTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="votingTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <IconSend class="i-medium" :fill="'rgb(var(--main))'" />
              <h3 class="h4 t-medium">Voting</h3>
              <span class="p-small t-grey">({{ votingTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in votingTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="proposedTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <IconEntityInfo class="i-medium" :fill="'rgb(var(--grey))'" />
              <h3 class="h4 t-medium">Proposed</h3>
              <span class="p-small t-grey">({{ proposedTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in proposedTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="notStartedTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <svg class="w-5r h-5r fill-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <h3 class="h4 t-medium">Not Started</h3>
              <span class="p-small t-grey">({{ notStartedTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in notStartedTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>

          <div v-if="blockedTasks.length > 0">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <svg class="w-5r h-5r fill-red-nice" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <h3 class="h4 t-medium">Blocked</h3>
              <span class="p-small t-grey">({{ blockedTasks.length }})</span>
            </div>
            <div class="cols-3 gap-small mobile:cols-1 tablet:cols-2">
              <CardTaskItem
                v-for="task in blockedTasks"
                :key="task.id"
                :task="task"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>
