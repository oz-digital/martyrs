<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import TaskStatusBadge from '../partials/TaskStatusBadge.vue';
import { mockTasks, mockInitiatives, mockMilestones, mockVotings } from '../../../data/mockData';
import { IconArrow, IconCheck, IconCross, IconProfile, IconCalendar, IconAttach, IconGroups, IconTime, IconLock, IconSend } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();
const showAssignForm = ref(false);

const task = computed(() => mockTasks.find(t => t.id === route.params.id));
const initiative = computed(() => task.value ? mockInitiatives.find(i => i.id === task.value.initiativeId) : null);
const milestone = computed(() => task.value ? mockMilestones.find(m => m.id === task.value.milestoneId) : null);
const startVoting = computed(() => task.value?.startVotingId ? mockVotings.find(v => v.id === task.value.startVotingId) : null);
const approvalVoting = computed(() => task.value?.approvalVotingId ? mockVotings.find(v => v.id === task.value.approvalVotingId) : null);

const priorityConfig = {
  low: { label: 'Low', color: 't-green-nice', bg: 'bg-green-small' },
  medium: { label: 'Medium', color: 't-yellow-nice', bg: 'bg-yellow-small' },
  high: { label: 'High', color: 't-red-nice', bg: 'bg-red-small' },
};

const priority = computed(() => task.value ? priorityConfig[task.value.priority] : null);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const handleAssignToMe = () => console.log('Assigning task to current user');
const handleSubmitForReview = () => console.log('Submitting task for review');
const handleCompleteTask = () => console.log('Completing task');
const handleAssignTask = (userId) => {
  console.log('Assigning task to user:', userId);
  showAssignForm.value = false;
};
const handleMerge = () => console.log('Merging changes');
const handleApproveBudget = () => console.log('Approving budget');
const handleDeploy = () => console.log('Deploying changes');
const handleVeto = () => console.log('Vetoing task');
</script>

<template>
  <div v-if="!task" class="min-h-100vh bg-light flex flex-center flex">
    <div class="t-center">
      <h2 class="h2 t-medium mn-b-thin">Task not found</h2>
      <router-link :to="{ name: 'Initiatives' }" class="t-main hover-t-main-semi">
        Back to initiatives
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-100vh bg-light">
    <div class="w-max-60r mn-auto pd-medium pd-y-semi">
      <router-link
        :to="milestone ? { name: 'Milestone', params: { id: milestone.id } } : { name: 'Initiative', params: { id: task.initiativeId } }"
        class="flex flex-v-center t-grey hover-t-dark mn-b-semi transition-cubic-in-out"
        style="text-decoration: none; width: fit-content;"
      >
        <IconArrow class="i-medium mn-r-thin" :rotation="180" :fill="'currentColor'" />
        Back to {{ milestone ? 'milestone' : 'initiative' }}
      </router-link>

      <div class="bg-white radius-semi o-hidden mn-b-semi">
        <div class="pd-semi">
          <div class="flex flex-justify-between flex-v-start mn-b-semi">
            <div class="flex-child-1">
              <div class="flex flex-v-center gap-small mn-b-small">
                <TaskStatusBadge :status="task.status" />
                <span :class="`pd-micro pd-x-small radius-round p-micro t-medium ${priority.bg} ${priority.color} flex flex-v-center gap-micro`">
                  <svg class="w-3r h-3r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  {{ priority.label }} Priority
                </span>
                <span v-if="task.passed" class="pd-micro pd-x-small radius-round p-micro t-medium bg-green-small t-green-nice flex flex-v-center gap-micro">
                  <IconCheck class="i-small" :fill="'currentColor'" />
                  Passed
                </span>
              </div>
              <h1 class="h1 t-medium mn-b-medium">{{ task.title }}</h1>
              <p class="p-semi t-grey t-line-relaxed" style="white-space: pre-wrap;">{{ task.description }}</p>
            </div>
          </div>

          <div class="br-t br-1px br-light pd-t-semi">
            <div class="cols-2 gap-semi">
              <div class="flex flex-column gap-regular">
                <div class="flex flex-v-start gap-small">
                  <IconProfile class="i-medium mn-t-micro" :fill="'rgb(var(--grey))'" />
                  <div class="flex-child-1">
                    <div class="p-small t-grey mn-b-thin">Assignee</div>
                    <div v-if="task.assignee" class="flex flex-v-center gap-thin">
                      <img :src="task.assignee.avatar" :alt="task.assignee.name" class="i-medium radius-extra" />
                      <span class="t-medium">{{ task.assignee.name }}</span>
                    </div>
                    <div v-else class="flex flex-column gap-thin">
                      <span class="t-grey">Unassigned</span>
                      <div v-if="task.status === 'not_started'" class="flex gap-thin">
                        <button @click="handleAssignToMe" class="bg-main hover-bg-main-semi t-white p-small t-medium pd-micro pd-x-small radius-medium transition-cubic-in-out">
                          Assign to Me
                        </button>
                        <button @click="showAssignForm = true" class="bg-white hover-bg-light t-grey br-1px br-light p-small t-medium pd-micro pd-x-small radius-medium transition-cubic-in-out">
                          Assign to User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-v-start gap-small">
                  <IconCalendar class="i-medium mn-t-micro" :fill="'rgb(var(--grey))'" />
                  <div>
                    <div class="p-small t-grey mn-b-micro">Created / Due Date</div>
                    <div class="t-medium">{{ formatDate(task.createdAt) }} → {{ formatDate(task.dueDate) }}</div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex flex-v-start gap-small">
                  <svg class="w-5r h-5r t-grey mn-t-micro" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <div>
                    <div class="p-small t-grey mn-b-thin">Tags</div>
                    <div class="flex flex-wrap gap-thin">
                      <span v-for="tag in task.tags" :key="tag" class="pd-micro pd-x-small bg-light t-grey p-small radius-round">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="br-t br-1px br-light mn-t-semi pd-t-semi">
            <div class="flex flex-v-center gap-thin mn-b-medium">
              <svg class="w-5r h-5r t-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <h3 class="p-regular t-medium">Repository Information</h3>
            </div>
            <div class="cols-3 gap-regular mn-b-medium">
              <div class="pd-small bg-light radius-medium">
                <div class="p-micro t-grey mn-b-micro">Project</div>
                <div class="t-medium">{{ task.project }}</div>
              </div>
              <div class="pd-small bg-light radius-medium">
                <div class="p-micro t-grey mn-b-micro">Repository</div>
                <div class="t-medium">{{ task.repository }}</div>
              </div>
              <div class="pd-small bg-light radius-medium">
                <div class="p-micro t-grey mn-b-micro">Branch</div>
                <div class="t-medium">{{ task.branch || 'Not created' }}</div>
              </div>
            </div>
            <div class="flex flex-justify-between flex-v-center">
              <div v-if="task.mergeRequests.length > 0">
                <div class="p-micro t-grey mn-b-thin">Merge Requests</div>
                <div class="flex flex-wrap gap-thin">
                  <span v-for="mr in task.mergeRequests" :key="mr" class="pd-micro pd-x-small bg-main-small t-main p-small radius-round flex flex-v-center gap-micro">
                    <svg class="w-3r h-3r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="18" r="3"/>
                      <circle cx="6" cy="6" r="3"/>
                      <path d="M6 21V9a9 9 0 0 0 9 9"/>
                    </svg>
                    {{ mr }}
                  </span>
                </div>
              </div>
              <div class="flex gap-thin">
                <button v-if="task.permissions.merge" @click="handleMerge" class="bg-fifth hover-bg-fifth-semi t-white p-small t-medium pd-small pd-x-medium radius-medium transition-cubic-in-out flex flex-v-center gap-thin">
                  <svg class="w-4r h-4r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="18" r="3"/>
                    <circle cx="6" cy="6" r="3"/>
                    <path d="M6 21V9a9 9 0 0 0 9 9"/>
                  </svg>
                  Merge
                </button>
                <button v-if="task.permissions.deploy" @click="handleDeploy" class="bg-orange-nice hover-bg-orange-semi t-white p-small t-medium pd-small pd-x-medium radius-medium transition-cubic-in-out flex flex-v-center gap-thin">
                  <svg class="w-4r h-4r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="initiative || milestone" class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-v-center gap-thin mn-b-medium">
          <IconAttach class="i-medium" :fill="'rgb(var(--grey))'" />
          <h3 class="p-regular t-medium">Part Of</h3>
        </div>
        <div class="cols-2 gap-small">
          <router-link v-if="initiative" :to="{ name: 'Initiative', params: { id: initiative.id } }" class="d-block pd-medium bg-main-small br-1px br-main-semi radius-medium hover-bg-main-tiny transition-cubic-in-out">
            <div class="p-micro t-main t-medium mn-b-micro">Initiative</div>
            <div class="t-medium">{{ initiative.title }}</div>
          </router-link>
          <router-link v-if="milestone" :to="{ name: 'Milestone', params: { id: milestone.id } }" class="d-block pd-medium bg-green-small br-1px br-green-semi radius-medium hover-bg-green-tiny transition-cubic-in-out">
            <div class="p-micro t-green-nice t-medium mn-b-micro">Milestone</div>
            <div class="t-medium">{{ milestone.name }}</div>
          </router-link>
        </div>
      </div>

      <div class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-v-center gap-thin mn-b-medium">
          <IconGroups class="i-medium" :fill="'rgb(var(--grey))'" />
          <h3 class="p-semi t-medium">Task Governance & Budget</h3>
        </div>

        <div class="cols-2 gap-semi">
          <div class="flex flex-column gap-regular">
            <div class="pd-medium bg-light radius-medium">
              <h4 class="p-small t-medium mn-b-small">Task Acceptance</h4>
              <p class="p-small t-grey">
                <span v-if="task.startVotingId">This task requires <span class="t-medium t-main">public voting</span> to start work.</span>
                <span v-else>Team members can start working on this task directly.</span>
              </p>
            </div>

            <div class="pd-medium bg-light radius-medium">
              <h4 class="p-small t-medium mn-b-small">Approval Process</h4>
              <p class="p-small t-grey">
                <span v-if="task.approvalVotingId">Task completion requires <span class="t-medium t-main">public voting approval</span>.</span>
                <span v-else>Task completion is approved by team members.</span>
              </p>
            </div>

            <div class="pd-medium bg-light radius-medium">
              <h4 class="p-small t-medium mn-b-small">Decision Making</h4>
              <div class="flex flex-column gap-thin p-small">
                <div class="flex flex-justify-between">
                  <span class="t-grey">Governance Type:</span>
                  <span class="t-medium">{{ task.visibility.type === 'public' ? 'Community-based' : 'Team-based' }}</span>
                </div>
                <div class="flex flex-justify-between">
                  <span class="t-grey">Visibility:</span>
                  <span class="t-medium t-capitalize">{{ task.visibility.type }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-column gap-regular">
            <div class="pd-medium bg-gradient-green-blue br-1px br-green-semi radius-medium">
              <div class="flex flex-v-center gap-thin mn-b-small">
                <svg class="w-5r h-5r t-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h4 class="p-small t-medium">Budget</h4>
              </div>
              <div class="flex flex-justify-between flex-v-center mn-b-small">
                <div class="h2 t-medium">{{ task.budget.amount }} {{ task.budget.currency }}</div>
                <div>
                  <span v-if="task.budget.approved" class="flex flex-v-center gap-micro t-green-nice t-medium p-small">
                    <IconCheck class="i-small" :fill="'currentColor'" />
                    Approved
                  </span>
                  <span v-else class="flex flex-v-center gap-micro t-yellow-nice t-medium p-small">
                    <IconTime class="i-small" :fill="'currentColor'" />
                    Pending
                  </span>
                </div>
              </div>
              <button v-if="task.permissions.budget && !task.budget.approved" @click="handleApproveBudget" class="w-100 bg-green-nice hover-bg-green-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out flex flex-center flex gap-thin">
                <svg class="w-4r h-4r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Approve Budget
              </button>
            </div>

            <div class="pd-medium bg-light radius-medium">
              <h4 class="p-small t-medium mn-b-small">Permissions</h4>
              <div class="flex flex-column gap-thin">
                <div class="flex flex-justify-between flex-v-center p-small">
                  <span class="t-grey">Merge Rights</span>
                  <IconCheck v-if="task.permissions.merge" class="i-small" :fill="'rgb(var(--green-nice))'" />
                  <IconCross v-else class="i-small" :fill="'rgb(var(--grey))'" />
                </div>
                <div class="flex flex-justify-between flex-v-center p-small">
                  <span class="t-grey">Budget Approval</span>
                  <IconCheck v-if="task.permissions.budget" class="i-small" :fill="'rgb(var(--green-nice))'" />
                  <IconCross v-else class="i-small" :fill="'rgb(var(--grey))'" />
                </div>
                <div class="flex flex-justify-between flex-v-center p-small">
                  <span class="t-grey">Deploy Rights</span>
                  <IconCheck v-if="task.permissions.deploy" class="i-small" :fill="'rgb(var(--green-nice))'" />
                  <IconCross v-else class="i-small" :fill="'rgb(var(--grey))'" />
                </div>
                <div class="flex flex-justify-between flex-v-center p-small">
                  <span class="t-grey">Veto Power</span>
                  <IconCheck v-if="task.permissions.veto" class="i-small" :fill="'rgb(var(--green-nice))'" />
                  <IconCross v-else class="i-small" :fill="'rgb(var(--grey))'" />
                </div>
              </div>
              <button v-if="task.permissions.veto" @click="handleVeto" class="w-100 mn-t-small bg-red-nice hover-bg-red-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out flex flex-center flex gap-thin">
                <IconLock class="i-small" :fill="'currentColor'" />
                Veto Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white radius-semi pd-semi">
        <div class="flex flex-v-center gap-thin mn-b-medium">
          <IconSend class="i-medium" :fill="'rgb(var(--grey))'" />
          <h3 class="p-semi t-medium">Governance & Voting</h3>
        </div>
        <div class="cols-2 gap-regular">
          <div class="br-2px br-main-semi radius-medium pd-medium bg-main-small">
            <div class="p-micro t-main t-medium t-uppercase mn-b-small">Start Voting</div>
            <template v-if="startVoting">
              <router-link :to="{ name: 'Voting', params: { id: startVoting.id } }" class="d-block hover-bg-main-tiny radius-medium transition-cubic-in-out" style="margin: -1rem; padding: 1rem;">
                <h4 class="t-medium mn-b-thin">{{ startVoting.title }}</h4>
                <div class="flex flex-v-center gap-thin mn-b-small">
                  <TaskStatusBadge :status="startVoting.status" />
                </div>
                <div class="p-small t-grey flex flex-justify-between">
                  <span>Yes: {{ startVoting.yesVotes }}</span>
                  <span>No: {{ startVoting.noVotes }}</span>
                  <span>Abstain: {{ startVoting.abstainVotes }}</span>
                </div>
              </router-link>
              <div v-if="startVoting.status === 'approved' && task.status === 'not_started' && task.assignee" class="mn-t-small pd-t-small br-t br-1px br-main-semi">
                <button @click="handleSubmitForReview" class="w-100 bg-main hover-bg-main-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out">
                  Begin Work
                </button>
              </div>
            </template>
            <template v-else>
              <p class="p-small t-grey mn-b-small">No start voting required. Team members can begin work directly.</p>
              <button v-if="task.status === 'proposed'" class="w-100 bg-main hover-bg-main-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out">
                Create Start Voting
              </button>
            </template>
          </div>

          <div class="br-2px br-green-semi radius-medium pd-medium bg-green-small">
            <div class="p-micro t-green-nice t-medium t-uppercase mn-b-small">Approval Voting</div>
            <template v-if="approvalVoting">
              <router-link :to="{ name: 'Voting', params: { id: approvalVoting.id } }" class="d-block hover-bg-green-tiny radius-medium transition-cubic-in-out" style="margin: -1rem; padding: 1rem;">
                <h4 class="t-medium mn-b-thin">{{ approvalVoting.title }}</h4>
                <div class="flex flex-v-center gap-thin mn-b-small">
                  <TaskStatusBadge :status="approvalVoting.status" />
                </div>
                <div class="p-small t-grey flex flex-justify-between">
                  <span>Yes: {{ approvalVoting.yesVotes }}</span>
                  <span>No: {{ approvalVoting.noVotes }}</span>
                  <span>Abstain: {{ approvalVoting.abstainVotes }}</span>
                </div>
              </router-link>
              <div v-if="approvalVoting.status === 'approved' && task.status === 'review'" class="mn-t-small pd-t-small br-t br-1px br-green-semi">
                <button @click="handleCompleteTask" class="w-100 bg-green-nice hover-bg-green-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out">
                  Complete Task
                </button>
              </div>
            </template>
            <template v-else>
              <p class="p-small t-grey mn-b-small">Not submitted for approval yet.</p>
              <button v-if="task.status === 'in_progress' && task.assignee" @click="handleSubmitForReview" class="w-100 bg-green-nice hover-bg-green-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out">
                Submit for Review
              </button>
              <button v-if="task.status === 'review'" class="w-100 bg-green-nice hover-bg-green-semi t-white p-small t-medium pd-small radius-medium transition-cubic-in-out">
                Create Approval Voting
              </button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="showAssignForm" class="fixed inset-0 bg-dark-overlay flex flex-center flex z-50" @click.self="showAssignForm = false">
        <div class="bg-white radius-medium pd-semi w-max-30r">
          <div class="flex flex-justify-between flex-v-center mn-b-medium">
            <h3 class="h3 t-medium">Assign Task</h3>
            <button @click="showAssignForm = false" class="t-grey hover-t-dark transition-cubic-in-out">
              <IconCross class="i-medium" :fill="'currentColor'" />
            </button>
          </div>
          <p class="p-regular t-grey t-center">Task assignment form coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>
