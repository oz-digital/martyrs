<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import VoteForm from '../partials/VoteForm.vue';
import VotingResults from '../partials/VotingResults.vue';
import LinkedEntityCard from '../partials/LinkedEntityCard.vue';
import { mockVotings, mockTasks, mockInitiatives, mockMilestones } from '../../../data/mockData';
import { IconArrow, IconCalendar } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();
const hasVoted = ref(false);

const voting = computed(() => mockVotings.find(v => v.id === route.params.id));

const typeConfig = {
  create_task: { label: 'Create Task', color: 'bg-main-small t-main' },
  approve_task: { label: 'Approve Task', color: 'bg-green-nice t-white' },
  general: { label: 'General', color: 'bg-fifth-small t-fifth' },
};

const typeInfo = computed(() => voting.value ? (typeConfig[voting.value.type] || typeConfig.general) : null);
const isActive = computed(() => voting.value && voting.value.status === 'pending');

const percentageYes = computed(() =>
  voting.value && voting.value.totalVotes > 0
    ? (voting.value.yesVotes / voting.value.totalVotes) * 100
    : 0
);
const percentageNo = computed(() =>
  voting.value && voting.value.totalVotes > 0
    ? (voting.value.noVotes / voting.value.totalVotes) * 100
    : 0
);

const results = computed(() => {
  if (!voting.value) return null;
  return {
    totalVotes: voting.value.totalVotes,
    yesVotes: voting.value.yesVotes,
    noVotes: voting.value.noVotes,
    abstainVotes: voting.value.abstainVotes,
    percentageYes: percentageYes.value,
    percentageNo: percentageNo.value,
    threshold: voting.value.threshold,
  };
});

const linkedEntity = computed(() => {
  if (!voting.value) return null;

  if (voting.value.linkedEntityType === 'task' && voting.value.linkedEntityId) {
    const task = mockTasks.find(t => t.id === voting.value.linkedEntityId);
    if (task) {
      return {
        type: 'task',
        data: { id: task.id, title: task.title, status: task.status }
      };
    }
  } else if (voting.value.linkedEntityType === 'initiative' && voting.value.linkedEntityId) {
    const initiative = mockInitiatives.find(i => i.id === voting.value.linkedEntityId);
    if (initiative) {
      return {
        type: 'initiative',
        data: { id: initiative.id, title: initiative.title, status: initiative.status }
      };
    }
  } else if (voting.value.linkedEntityType === 'milestone' && voting.value.linkedEntityId) {
    const milestone = mockMilestones.find(m => m.id === voting.value.linkedEntityId);
    if (milestone) {
      return {
        type: 'milestone',
        data: { id: milestone.id, name: milestone.name, status: milestone.status }
      };
    }
  }
  return null;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleVoteSubmit = (vote, comment) => {
  console.log('Vote submitted:', { vote, comment });
  hasVoted.value = true;
};
</script>

<template>
  <div v-if="!voting" class="min-h-100vh bg-light flex flex-center flex">
    <div class="t-center">
      <h2 class="h2 t-medium mn-b-thin">Voting not found</h2>
      <router-link :to="{ name: 'Votings' }" class="t-main hover-t-main-semi">
        Back to votings
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-100vh bg-light">
    <div class="w-max-50r mn-auto pd-medium pd-y-semi">
      <router-link
        :to="{ name: 'Votings' }"
        class="flex flex-v-center t-grey hover-t-dark mn-b-semi transition-cubic-in-out"
        style="text-decoration: none; width: fit-content;"
      >
        <IconArrow class="i-medium mn-r-thin" :rotation="180" :fill="'currentColor'" />
        Back to votings
      </router-link>

      <div class="bg-white radius-semi o-hidden mn-b-semi">
        <div class="pd-semi">
          <div class="flex flex-justify-between flex-v-start mn-b-semi">
            <div class="flex-child-1">
              <div class="flex flex-v-center gap-small mn-b-small">
                <span :class="`pd-micro pd-x-small radius-regular p-micro t-medium ${typeInfo.color}`">
                  {{ typeInfo.label }}
                </span>
                <TaskStatusBadge :status="voting.status" />
              </div>
              <h1 class="h1 t-medium mn-b-medium">{{ voting.title }}</h1>
              <p class="p-semi t-grey t-line-relaxed">{{ voting.description }}</p>
            </div>
          </div>

          <div class="br-t br-1px br-light pd-t-semi mn-b-semi">
            <div class="cols-2 gap-semi">
              <div class="flex flex-v-start gap-small">
                <IconCalendar class="i-medium mn-t-micro" :fill="'rgb(var(--grey))'" />
                <div>
                  <div class="p-small t-grey mn-b-micro">Created</div>
                  <div class="p-regular t-medium">{{ formatDate(voting.createdAt) }}</div>
                </div>
              </div>
              <div class="flex flex-v-start gap-small">
                <IconCalendar class="i-medium mn-t-micro" :fill="'rgb(var(--grey))'" />
                <div>
                  <div class="p-small t-grey mn-b-micro">Ends</div>
                  <div class="p-regular t-medium">{{ formatDate(voting.endDate) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="linkedEntity" class="br-t br-1px br-light pd-t-semi mn-b-semi">
            <h3 class="p-small t-medium mn-b-small">Related Item</h3>
            <LinkedEntityCard :entityType="linkedEntity.type" :entityData="linkedEntity.data" />
          </div>

          <div class="br-t br-1px br-light pd-t-semi">
            <VotingResults :results="results" :votes="voting.votes" />
          </div>
        </div>
      </div>

      <div v-if="isActive && !hasVoted" class="bg-white radius-semi pd-semi">
        <VoteForm @submit="handleVoteSubmit" />
      </div>

      <div v-if="hasVoted" class="bg-green-small br-1px br-green-nice radius-semi pd-semi t-center">
        <div class="t-green-nice t-medium h5 mn-b-thin">Thank you for voting!</div>
        <p class="t-green-nice">Your vote has been recorded.</p>
      </div>

      <div v-if="!isActive" class="bg-light br-1px br-light radius-semi pd-semi t-center">
        <div class="t-grey t-medium h5 mn-b-thin">Voting Closed</div>
        <p class="t-grey">This voting has ended.</p>
      </div>
    </div>
  </div>
</template>
