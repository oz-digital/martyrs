<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CardMilestoneItem from '../blocks/CardMilestoneItem.vue';
import EmptyState from '../partials/EmptyState.vue';
import { mockInitiatives, mockMilestones } from '../../../data/mockData';
import { IconArrow, IconCalendar, IconTime, IconEntityInfo, IconCheck } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();

const initiative = computed(() => mockInitiatives.find(i => i.id === route.params.id));
const milestones = computed(() => mockMilestones.filter(m => m.initiativeId === route.params.id));

const completedMilestones = computed(() => milestones.value.filter(m => m.status === 'completed'));
const inProgressMilestones = computed(() => milestones.value.filter(m => m.status === 'in_progress'));
const notStartedMilestones = computed(() => milestones.value.filter(m => m.status === 'not_started'));

const overallProgress = computed(() => {
  return milestones.value.length > 0
    ? Math.round((completedMilestones.value.length / milestones.value.length) * 100)
    : 0;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<template>
  <div v-if="!initiative" class="min-h-100vh bg-light flex flex-center flex">
    <div class="t-center">
      <h2 class="h2 t-medium mn-b-thin">Initiative not found</h2>
      <router-link :to="{ name: 'Initiatives' }" class="t-main hover-t-main-semi">
        Back to initiatives
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-100vh bg-light">
    <div class="w-max-50r mn-auto pd-medium pd-y-semi">
      <router-link
        :to="{ name: 'Initiative', params: { id: route.params.id } }"
        class="flex flex-v-center t-grey hover-t-dark mn-b-semi transition-cubic-in-out"
        style="text-decoration: none; width: fit-content;"
      >
        <IconArrow class="i-medium mn-r-thin" :rotation="180" :fill="'currentColor'" />
        Back to initiative
      </router-link>

      <div class="bg-white radius-semi o-hidden pd-semi mn-b-semi">
        <div class="flex flex-justify-between flex-v-start mn-b-semi">
          <div class="flex-child-1">
            <h1 class="h1 t-medium mn-b-thin">{{ initiative.title }}</h1>
            <p class="p-semi t-grey mn-b-medium">{{ initiative.description }}</p>
            <div class="flex flex-v-center gap-semi p-small">
              <div v-if="initiative.date" class="flex flex-v-center gap-thin t-grey">
                <IconCalendar class="i-small" :fill="'currentColor'" />
                <span>Started {{ formatDate(initiative.date) }}</span>
              </div>
              <div v-if="initiative.targetReleaseDate" class="flex flex-v-center gap-thin t-grey">
                <IconCalendar class="i-small" :fill="'currentColor'" />
                <span>Target {{ formatDate(initiative.targetReleaseDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="br-t br-1px br-light pd-t-semi">
          <div class="flex flex-justify-between flex-v-center mn-b-small">
            <span class="p-small t-medium t-grey">Overall Progress</span>
            <span class="h2 t-medium">{{ overallProgress }}%</span>
          </div>
          <div class="w-100 bg-light radius-round h-3r o-hidden mn-b-medium">
            <div
              class="bg-main h-100 transition-cubic-in-out"
              :style="{ width: `${overallProgress}%` }"
            />
          </div>
          <div class="flex flex-v-center gap-semi p-small">
            <div class="flex flex-v-center gap-thin">
              <div class="w-3r h-3r bg-green-nice radius-round" />
              <span class="t-grey">{{ completedMilestones.length }} Completed</span>
            </div>
            <div class="flex flex-v-center gap-thin">
              <div class="w-3r h-3r bg-main radius-round" />
              <span class="t-grey">{{ inProgressMilestones.length }} In Progress</span>
            </div>
            <div class="flex flex-v-center gap-thin">
              <div class="w-3r h-3r bg-grey radius-round" />
              <span class="t-grey">{{ notStartedMilestones.length }} Not Started</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mn-b-semi">
        <h2 class="h2 t-medium">Milestones Roadmap</h2>
        <p class="p-regular t-grey mn-t-micro">Track progress across all milestones</p>
      </div>

      <EmptyState
        v-if="milestones.length === 0"
        title="No milestones yet"
        message="Create milestones to start tracking progress on this initiative."
      />

      <div v-else class="flex flex-column gap-semi">
        <div v-if="inProgressMilestones.length > 0">
          <div class="flex flex-v-center gap-thin mn-b-medium">
            <IconTime class="i-medium" :fill="'rgb(var(--main))'" />
            <h3 class="p-semi t-medium">In Progress</h3>
            <span class="p-small t-grey">({{ inProgressMilestones.length }})</span>
          </div>
          <div class="cols-3 gap-semi">
            <CardMilestoneItem
              v-for="milestone in inProgressMilestones"
              :key="milestone.id"
              :milestone="milestone"
            />
          </div>
        </div>

        <div v-if="notStartedMilestones.length > 0">
          <div class="flex flex-v-center gap-thin mn-b-medium">
            <IconEntityInfo class="i-medium" :fill="'rgb(var(--grey))'" />
            <h3 class="p-semi t-medium">Not Started</h3>
            <span class="p-small t-grey">({{ notStartedMilestones.length }})</span>
          </div>
          <div class="cols-3 gap-semi">
            <CardMilestoneItem
              v-for="milestone in notStartedMilestones"
              :key="milestone.id"
              :milestone="milestone"
            />
          </div>
        </div>

        <div v-if="completedMilestones.length > 0">
          <div class="flex flex-v-center gap-thin mn-b-medium">
            <IconCheck class="i-medium" :fill="'rgb(var(--green-nice))'" />
            <h3 class="p-semi t-medium">Completed</h3>
            <span class="p-small t-grey">({{ completedMilestones.length }})</span>
          </div>
          <div class="cols-3 gap-semi">
            <CardMilestoneItem
              v-for="milestone in completedMilestones"
              :key="milestone.id"
              :milestone="milestone"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
