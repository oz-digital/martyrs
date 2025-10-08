<script setup>
import { defineProps, computed } from 'vue';
import { IconCheck, IconCross, IconSend } from '@martyrs/src/modules/icons/icons.client.js';

const props = defineProps({
  results: {
    type: Object,
    required: true
  },
  votes: {
    type: Array,
    default: () => []
  }
});

const { totalVotes, yesVotes, noVotes, abstainVotes, percentageYes, percentageNo, threshold } = props.results;
const percentageAbstain = computed(() => 100 - percentageYes - percentageNo);
const thresholdMet = computed(() => percentageYes >= threshold * 100);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getVoteColor = (vote) => {
  switch (vote) {
    case 'yes': return 't-green-nice';
    case 'no': return 't-red-nice';
    case 'abstain': return 't-grey';
    default: return 't-grey';
  }
};
</script>

<template>
  <div class="flex flex-column gap-semi">
    <div>
      <div class="flex flex-justify-between flex-v-center mn-b-small">
        <h3 class="h5 t-medium">Voting Results</h3>
        <div :class="`flex flex-v-center gap-thin ${thresholdMet ? 't-green-nice' : 't-red-nice'}`">
          <IconCheck v-if="thresholdMet" class="i-medium" :fill="'currentColor'" />
          <IconCross v-else class="i-medium" :fill="'currentColor'" />
          <span class="t-medium">{{ thresholdMet ? 'Threshold Met' : 'Threshold Not Met' }}</span>
        </div>
      </div>

      <div class="bg-light radius-medium pd-medium mn-b-medium">
        <div class="flex flex-justify-between flex-v-center mn-b-thin">
          <span class="p-small t-medium t-grey">Total Votes</span>
          <span class="h2 t-medium">{{ totalVotes }}</span>
        </div>
        <div class="p-small t-grey">
          Threshold: {{ (threshold * 100).toFixed(0) }}% approval required
        </div>
      </div>

      <div class="w-100 h-8r bg-light radius-medium o-hidden flex">
        <div
          v-if="percentageYes > 0"
          class="bg-green-nice flex flex-center flex p-small t-white t-medium"
          :style="{ width: `${percentageYes}%` }"
        >
          <span v-if="percentageYes >= 15">{{ percentageYes.toFixed(0) }}%</span>
        </div>
        <div
          v-if="percentageNo > 0"
          class="bg-red-nice flex flex-center flex p-small t-white t-medium"
          :style="{ width: `${percentageNo}%` }"
        >
          <span v-if="percentageNo >= 15">{{ percentageNo.toFixed(0) }}%</span>
        </div>
        <div
          v-if="percentageAbstain > 0"
          class="bg-grey flex flex-center flex p-small t-white t-medium"
          :style="{ width: `${percentageAbstain}%` }"
        >
          <span v-if="percentageAbstain >= 15">{{ percentageAbstain.toFixed(0) }}%</span>
        </div>
      </div>

      <div class="cols-3 gap-regular mn-t-medium">
        <div class="t-center">
          <div class="h2 t-medium t-green-nice">{{ yesVotes }}</div>
          <div class="p-small t-grey">Yes ({{ percentageYes.toFixed(1) }}%)</div>
        </div>
        <div class="t-center">
          <div class="h2 t-medium t-red-nice">{{ noVotes }}</div>
          <div class="p-small t-grey">No ({{ percentageNo.toFixed(1) }}%)</div>
        </div>
        <div class="t-center">
          <div class="h2 t-medium t-grey">{{ abstainVotes }}</div>
          <div class="p-small t-grey">Abstain ({{ percentageAbstain.toFixed(1) }}%)</div>
        </div>
      </div>
    </div>

    <div>
      <h4 class="h5 t-medium mn-b-medium flex flex-v-center">
        <IconSend class="i-medium mn-r-thin" :fill="'currentColor'" />
        All Votes ({{ votes.length }})
      </h4>
      <div class="flex flex-column gap-small">
        <div v-for="(vote, index) in votes" :key="index" class="bg-light radius-medium pd-medium">
          <div class="flex flex-justify-between flex-v-start mn-b-thin">
            <div class="flex flex-v-center gap-small">
              <div class="i-big radius-extra bg-grey flex flex-center flex t-medium">
                {{ vote.userName.charAt(0) }}
              </div>
              <div>
                <div class="p-regular t-medium">{{ vote.userName }}</div>
                <div class="p-micro t-grey">{{ formatDate(vote.createdAt) }}</div>
              </div>
            </div>
            <span :class="`t-medium t-capitalize ${getVoteColor(vote.vote)}`">
              {{ vote.vote }}
            </span>
          </div>
          <p v-if="vote.comment" class="p-small t-grey mn-l-13r">{{ vote.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
