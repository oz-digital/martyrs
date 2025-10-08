<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import CardVotingItem from '../blocks/CardVotingItem.vue';
import EmptyState from '../partials/EmptyState.vue';
import { mockVotings } from '../../../data/mockData';

const route = useRoute();
const votings = ref(mockVotings);
const typeFilter = ref('all');
const statusFilter = ref('all');

const filteredVotings = computed(() => {
  return votings.value.filter((voting) => {
    const matchesType = typeFilter.value === 'all' || voting.type === typeFilter.value;
    const matchesStatus = statusFilter.value === 'all' || voting.status === statusFilter.value;
    return matchesType && matchesStatus;
  });
});
</script>

<template>
  <div>
    <div v-if="!route.params.id" class="min-h-100vh bg-light">
      <div class="w-max-66r mn-auto pd-medium pd-y-semi">
        <div class="mn-b-semi">
          <h1 class="h1 t-medium mn-b-thin">Votings</h1>
          <p class="p-regular t-grey">View and participate in all active votings</p>
        </div>

        <div class="bg-white radius-medium pd-semi mn-b-semi">
          <div class="cols-2 gap-regular mobile:cols-1">
            <div>
              <label for="typeFilter" class="d-block p-small t-medium mn-b-thin">Type</label>
              <select
                id="typeFilter"
                v-model="typeFilter"
                class="w-100 pd-medium br-1px br-light radius-medium"
                style="outline: none;"
              >
                <option value="all">All Types</option>
                <option value="create_task">Create Task</option>
                <option value="approve_task">Approve Task</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label for="statusFilter" class="d-block p-small t-medium mn-b-thin">Status</label>
              <select
                id="statusFilter"
                v-model="statusFilter"
                class="w-100 pd-medium br-1px br-light radius-medium"
                style="outline: none;"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="filteredVotings.length === 0">
          <EmptyState
            title="No votings found"
            message="Try adjusting your filters to see more votings."
          >
            <template #icon>
              <svg class="w-12r h-12r t-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </template>
          </EmptyState>
        </div>

        <div v-else>
          <div class="flex flex-justify-between flex-v-center mn-b-medium">
            <p class="p-regular t-grey">
              Showing {{ filteredVotings.length }} of {{ votings.length }} votings
            </p>
          </div>
          <div class="cols-3 gap-semi mobile:cols-1 tablet:cols-2">
            <CardVotingItem
              v-for="voting in filteredVotings"
              :key="voting._id || voting.id"
              :voting="voting"
            />
          </div>
        </div>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>
