<script setup>
import { onMounted, ref, computed } from 'vue';
import { initiativesActions, initiativesState } from '../../store/initiatives';
import CardInitiativeItem from '../blocks/CardInitiativeItem.vue';
import EmptyState from '../partials/EmptyState.vue';
import { IconPlus, IconSearch, IconFilter } from '@martyrs/src/modules/icons/icons.client.js';

const initiatives = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const riskFilter = ref('all');
const showFilters = ref(false);

onMounted(async () => {
  await initiativesActions.getAllInitiatives();
  initiatives.value = initiativesState.all;
});

const filteredInitiatives = computed(() => {
  return initiatives.value.filter((initiative) => {
    const matchesSearch =
      searchQuery.value === '' ||
      (initiative.title && initiative.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (initiative.description && initiative.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (initiative.name && initiative.name.toLowerCase().includes(searchQuery.value.toLowerCase()));

    const matchesStatus =
      statusFilter.value === 'all' || initiative.status === statusFilter.value;

    const matchesRisk =
      riskFilter.value === 'all' ||
      (initiative.metrics && initiative.metrics.riskIndex === riskFilter.value);

    return matchesSearch && matchesStatus && matchesRisk;
  });
});

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  riskFilter.value = 'all';
};

const hasActiveFilters = computed(() =>
  statusFilter.value !== 'all' || riskFilter.value !== 'all'
);
</script>

<template>
  <div class="min-h-100vh bg-light">
    <div class="w-max-66r mn-auto pd-medium pd-y-semi">
      <div class="flex flex-justify-between flex-v-center mn-b-semi">
        <div>
          <h1 class="h1 t-medium">Initiatives</h1>
          <p class="p-regular t-grey mn-t-thin">Manage and track all your initiatives</p>
        </div>
        <router-link
          :to="{ name: 'Create Initiative' }"
          class="bg-main hover-bg-main-semi t-white t-medium pd-small pd-x-semi radius-medium flex flex-v-center gap-thin transition-cubic-in-out cursor-pointer"
          style="text-decoration: none;"
        >
          <IconPlus class="i-medium" :fill="'currentColor'" />
          Create Initiative
        </router-link>
      </div>

      <div class="bg-white radius-medium pd-medium mn-b-semi">
        <div class="flex flex-column gap-regular mobile:flex-row">
          <div class="flex-child-1 pos-relative">
            <IconSearch class="i-medium pos-absolute pos-l-small pos-t-regular" :fill="'rgb(var(--grey))'" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search initiatives by name, description..."
              class="w-100 pd-small pd-l-extra br-1px br-light radius-medium"
              style="outline: none;"
            />
          </div>

          <button
            @click="showFilters = !showFilters"
            class="flex flex-v-center gap-thin pd-medium br-1px br-light radius-medium hover-bg-light transition-cubic-in-out cursor-pointer bg-white"
          >
            <IconFilter class="i-medium" :fill="'currentColor'" />
            Filters
            <span v-if="hasActiveFilters" class="pd-micro pd-x-thin bg-main-small t-main radius-regular p-micro t-medium">
              Active
            </span>
          </button>
        </div>

        <div v-if="showFilters" class="mn-t-medium pd-t-medium br-t br-1px br-light">
          <div class="cols-3 gap-regular mobile:cols-1">
            <div>
              <label class="d-block p-small t-medium mn-b-thin">Status</label>
              <select
                v-model="statusFilter"
                class="w-100 pd-small br-1px br-light radius-medium"
                style="outline: none;"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div>
              <label class="d-block p-small t-medium mn-b-thin">Risk Level</label>
              <select
                v-model="riskFilter"
                class="w-100 pd-small br-1px br-light radius-medium"
                style="outline: none;"
              >
                <option value="all">All Risks</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div class="flex flex-align-end">
              <button
                @click="clearFilters"
                class="w-100 pd-small br-1px br-light radius-medium hover-bg-light transition-cubic-in-out cursor-pointer bg-white"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredInitiatives.length === 0 && initiatives.length > 0" class="bg-white radius-medium pd-extra t-center">
        <p class="p-semi t-grey mn-b-thin">No initiatives match your filters</p>
        <button
          @click="clearFilters"
          class="t-main hover-t-main-semi t-medium cursor-pointer bg-transparent border-none"
        >
          Clear filters
        </button>
      </div>

      <div v-else-if="filteredInitiatives.length === 0">
        <EmptyState
          title="No initiatives yet"
          message="Get started by creating your first initiative to organize your work."
          actionText="Create Initiative"
          @action="$router.push({ name: 'Create Initiative' })"
        >
          <template #icon>
            <svg class="w-12r h-12r t-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </template>
        </EmptyState>
      </div>

      <div v-else>
        <div class="mn-b-medium p-small t-grey">
          Showing {{ filteredInitiatives.length }} of {{ initiatives.length }} initiatives
        </div>
        <div class="cols-3 gap-semi mobile:cols-1 tablet:cols-2">
          <CardInitiativeItem
            v-for="initiative in filteredInitiatives"
            :key="initiative._id || initiative.id"
            :initiative="initiative"
          />
        </div>
      </div>
    </div>
  </div>
</template>
