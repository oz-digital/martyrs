<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CardMilestoneItem from '../blocks/CardMilestoneItem.vue';
import CardVotingItem from '../blocks/CardVotingItem.vue';
import { initiativesActions, initiativesState } from '../../store/initiatives';
import { mockInitiatives, mockMilestones, mockVotings } from '../../../data/mockData';
import { IconArrow, IconCheck, IconCross, IconFile, IconOpenLink, IconCalendar, IconSend, IconTime, IconAttach } from '@martyrs/src/modules/icons/icons.client.js';

const route = useRoute();
const showMilestoneForm = ref(false);
const showTaskForm = ref(false);
const showFullDescription = ref(false);

const initiative = computed(() => {
  const real = initiativesState.current;
  if (!real) return null;
  const mock = mockInitiatives[0];
  return {
    ...mock,
    id: real._id || real.id,
    title: real.name || real.title,
    name: real.name || real.title,
  };
});

const milestones = computed(() => mockMilestones.filter(m => m.initiativeId === route.params.id));
const relatedVotings = computed(() => mockVotings.filter(v => v.linkedEntityId === route.params.id));

onMounted(async () => {
  const id = route.params.id;
  await initiativesActions.getInitiativeById(id);
});

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-small t-green-nice br-green-semi' },
  draft: { label: 'Draft', color: 'bg-light t-grey br-light' },
  completed: { label: 'Completed', color: 'bg-main-small t-main br-main-semi' },
  archived: { label: 'Archived', color: 'bg-yellow-small t-yellow-nice br-yellow-semi' },
};

const status = computed(() => initiative.value ? (statusConfig[initiative.value.status] || statusConfig.draft) : null);

const coverUrl = computed(() => {
  if (!initiative.value?.cover) return null;
  return typeof initiative.value.cover === 'string'
    ? initiative.value.cover
    : initiative.value.cover.url;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const handleCreateMilestone = (data) => {
  console.log('Creating milestone:', data);
  showMilestoneForm.value = false;
};

const handleProposeTask = (data) => {
  console.log('Proposing task:', data);
  showTaskForm.value = false;
};
</script>

<template>
  <div v-if="!initiative" class="min-h-100vh bg-light flex flex-center flex">
    <div class="t-center">
      <h2 class="h2 t-medium mn-b-thin">Product not found</h2>
      <router-link :to="{ name: 'Initiatives' }" class="t-main hover-t-main-semi">
        Back to products
      </router-link>
    </div>
  </div>

  <div v-else class="min-h-100vh bg-light">
    <div class="w-max-50r mn-auto pd-medium pd-y-semi">
      <router-link
        :to="{ name: 'Initiatives' }"
        class="flex flex-v-center t-grey hover-t-dark mn-b-semi transition-cubic-in-out"
        style="text-decoration: none; width: fit-content;"
      >
        <IconArrow class="i-medium mn-r-thin" :rotation="180" :fill="'currentColor'" />
        Back to products
      </router-link>

      <div v-if="coverUrl" class="relative h-64r radius-semi o-hidden mn-b-semi">
        <img :src="coverUrl" :alt="initiative.title" class="w-100 h-100 o-cover" />
        <div class="absolute inset-0 bg-gradient-dark" />
        <div class="absolute bottom-6r left-6r right-6r">
          <h1 class="h-huge t-medium t-white mn-b-thin">{{ initiative.title }}</h1>
          <p class="p-semi t-white-90">{{ initiative.description }}</p>
        </div>
      </div>

      <div v-if="initiative.fullDescription || initiative.valueProposition || initiative.targetAudience || (initiative.successCriteria && initiative.successCriteria.length > 0) || initiative.team" class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-justify-between flex-v-center mn-b-medium">
          <h3 class="p-semi t-medium flex flex-v-center gap-thin">
            <IconFile class="i-medium" :fill="'rgb(var(--grey))'" />
            About This Initiative
          </h3>
          <div class="flex flex-v-center gap-small">
            <span :class="`pd-medium pd-x-medium radius-medium p-small t-medium br-1px ${status.color}`">
              {{ status.label }}
            </span>
            <button @click="showTaskForm = true" class="bg-main hover-bg-main-semi t-white t-medium pd-medium pd-x-medium radius-medium flex flex-v-center gap-thin transition-cubic-in-out p-small">
              <IconSend class="i-small" :fill="'currentColor'" />
              Open Voting
            </button>
          </div>
        </div>

        <div v-if="initiative.fullDescription" class="mn-b-medium">
          <p :class="`p-regular t-grey t-line-relaxed ${!showFullDescription && 't-line-clamp-3'}`">
            {{ initiative.fullDescription }}
          </p>
          <button v-if="initiative.fullDescription.length > 200" @click="showFullDescription = !showFullDescription" class="t-main hover-t-main-semi p-small t-medium mn-t-thin">
            {{ showFullDescription ? 'Show less' : 'Show more' }}
          </button>
        </div>

        <div v-if="showFullDescription">
          <div v-if="initiative.valueProposition" class="mn-b-medium">
            <h4 class="t-medium mn-b-thin">Value Proposition</h4>
            <p class="p-regular t-grey">{{ initiative.valueProposition }}</p>
          </div>

          <div v-if="initiative.targetAudience" class="mn-b-medium">
            <h4 class="t-medium mn-b-thin">Target Audience</h4>
            <p class="p-regular t-grey">{{ initiative.targetAudience }}</p>
          </div>

          <div v-if="initiative.successCriteria && initiative.successCriteria.length > 0">
            <h4 class="t-medium mn-b-small">Success Criteria</h4>
            <div class="flex flex-column gap-thin">
              <div v-for="(criteria, index) in initiative.successCriteria" :key="index" class="flex flex-v-start gap-thin">
                <IconCheck class="i-medium flex-shrink-0 mn-t-micro" :fill="'rgb(var(--green-nice))'" />
                <span class="p-regular t-grey">{{ criteria }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="initiative.releases && initiative.releases.length > 0" class="mn-t-semi pd-t-semi br-t br-1px br-light">
          <div class="flex flex-justify-between flex-v-center mn-b-small">
            <h4 class="t-medium">Recent Release</h4>
            <router-link :to="{ name: 'Roadmap', params: { id: route.params.id } }" class="t-main hover-t-main-semi p-small t-medium flex flex-v-center gap-micro transition-cubic-in-out">
              View All Releases
              <IconArrow class="i-small" :fill="'currentColor'" />
            </router-link>
          </div>
          <div class="br-1px br-light radius-medium pd-medium flex flex-justify-between flex-v-start bg-gradient-blue-white">
            <div>
              <h5 class="t-medium">{{ initiative.releases[0].version }}</h5>
              <p class="p-small t-grey">{{ formatDate(initiative.releases[0].date) }}</p>
              <p class="p-regular t-grey mn-t-micro">{{ initiative.releases[0].notes }}</p>
            </div>
            <span class="pd-small pd-x-medium bg-green-small t-green-nice radius-regular p-small t-medium">
              {{ initiative.releases[0].status }}
            </span>
          </div>
        </div>

        <div v-if="initiative.team" class="mn-t-semi pd-t-semi br-t br-1px br-light">
          <div class="flex flex-justify-between flex-v-center mn-b-small">
            <h4 class="t-medium">Team</h4>
            <router-link :to="{ name: 'Initiative', params: { id: route.params.id } }" class="t-main hover-t-main-semi p-small t-medium flex flex-v-center gap-micro transition-cubic-in-out">
              Manage Team
              <IconArrow class="i-small" :fill="'currentColor'" />
            </router-link>
          </div>
          <div class="cols-3 gap-regular">
            <div v-if="initiative.team.owners && initiative.team.owners.length > 0" class="br-1px br-light radius-medium pd-medium bg-gradient-amber-white">
              <h5 class="p-micro t-grey t-medium t-uppercase mn-b-small">Owners</h5>
              <div class="flex flex-column gap-thin">
                <div v-for="member in initiative.team.owners.slice(0, 3)" :key="member.id" class="flex flex-v-center gap-thin">
                  <img :src="member.avatar" :alt="member.name" class="i-medium radius-extra" />
                  <span class="p-small t-truncate">{{ member.name }}</span>
                </div>
                <span v-if="initiative.team.owners.length > 3" class="p-micro t-grey">+{{ initiative.team.owners.length - 3 }} more</span>
              </div>
            </div>

            <div v-if="initiative.team.coreTeam && initiative.team.coreTeam.length > 0" class="br-1px br-light radius-medium pd-medium bg-gradient-blue-white">
              <h5 class="p-micro t-grey t-medium t-uppercase mn-b-small">Core Team</h5>
              <div class="flex flex-column gap-thin">
                <div v-for="member in initiative.team.coreTeam.slice(0, 3)" :key="member.id" class="flex flex-v-center gap-thin">
                  <img :src="member.avatar" :alt="member.name" class="i-medium radius-extra" />
                  <span class="p-small t-truncate">{{ member.name }}</span>
                </div>
                <span v-if="initiative.team.coreTeam.length > 3" class="p-micro t-grey">+{{ initiative.team.coreTeam.length - 3 }} more</span>
              </div>
            </div>

            <div v-if="initiative.team.contributors && initiative.team.contributors.length > 0" class="br-1px br-light radius-medium pd-medium bg-gradient-green-white">
              <h5 class="p-micro t-grey t-medium t-uppercase mn-b-small">Contributors</h5>
              <div class="flex flex-column gap-thin">
                <div v-for="member in initiative.team.contributors.slice(0, 3)" :key="member.id" class="flex flex-v-center gap-thin">
                  <img :src="member.avatar" :alt="member.name" class="i-medium radius-extra" />
                  <span class="p-small t-truncate">{{ member.name }}</span>
                </div>
                <span v-if="initiative.team.contributors.length > 3" class="p-micro t-grey">+{{ initiative.team.contributors.length - 3 }} more</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="initiative.metrics" class="mn-t-semi pd-t-semi br-t br-1px br-light">
          <h4 class="t-medium mn-b-small">Key Metrics</h4>
          <div class="cols-6 gap-regular">
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Task Progress</div>
              <div class="h2 t-medium">{{ initiative.metrics.taskProgress }}%</div>
            </div>
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Milestone Progress</div>
              <div class="h2 t-medium">{{ initiative.metrics.milestoneProgress }}%</div>
            </div>
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Risk Index</div>
              <div :class="`p-small t-medium t-capitalize pd-thin pd-x-thin radius-regular ${
                initiative.metrics.riskIndex === 'low' ? 'bg-green-small t-green-nice' :
                initiative.metrics.riskIndex === 'medium' ? 'bg-yellow-small t-yellow-nice' :
                'bg-red-small t-red-nice'
              }`">
                {{ initiative.metrics.riskIndex }}
              </div>
            </div>
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Availability</div>
              <div class="h2 t-medium">{{ initiative.metrics.availabilityIndex }}%</div>
            </div>
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Active Users</div>
              <div class="h2 t-medium">{{ initiative.metrics.activeUsers.toLocaleString() }}</div>
            </div>
            <div class="bg-light radius-medium pd-medium">
              <div class="p-micro t-grey mn-b-micro">Performance</div>
              <div class="h2 t-medium">{{ initiative.metrics.performance }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="relatedVotings.length > 0" class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-justify-between flex-v-center mn-b-semi">
          <div class="flex flex-v-center gap-thin">
            <IconSend class="i-medium" :fill="'rgb(var(--grey))'" />
            <h3 class="p-semi t-medium">Governance & Approvals</h3>
          </div>
          <router-link :to="{ name: 'Votings' }" class="t-main hover-t-main-semi p-small t-medium">
            View all votings
          </router-link>
        </div>
        <div class="cols-3 gap-regular">
          <CardVotingItem v-for="voting in relatedVotings.slice(0, 3)" :key="voting.id" :voting="voting" />
        </div>
      </div>

      <div v-if="initiative.sprints && initiative.sprints.length > 0" class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-justify-between flex-v-center mn-b-semi">
          <div class="flex flex-v-center gap-thin">
            <IconTime class="i-medium" :fill="'rgb(var(--grey))'" />
            <h3 class="p-semi t-medium">Active Sprints</h3>
          </div>
          <router-link :to="{ name: 'InitiativeMilestones', params: { id: route.params.id } }" class="t-main hover-t-main-semi p-small t-medium flex flex-v-center gap-micro">
            View Roadmap
            <IconArrow class="i-small" :fill="'currentColor'" />
          </router-link>
        </div>
        <div class="flex flex-column gap-regular">
          <router-link v-for="sprint in initiative.sprints" :key="sprint.id" :to="{ name: 'Milestone', params: { id: sprint.milestoneId } }" class="d-block br-1px br-light radius-medium pd-medium hover-br-main-semi hover-scale-1 transition-cubic-in-out">
            <div class="flex flex-justify-between flex-v-start mn-b-small">
              <div>
                <h4 class="t-medium">{{ sprint.name }}</h4>
                <p class="p-small t-grey">{{ sprint.theme }}</p>
              </div>
              <span class="p-small t-grey">
                {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
              </span>
            </div>

            <div class="flex flex-v-center gap-regular mn-b-small">
              <div class="flex-child-1">
                <div class="flex flex-justify-between p-small mn-b-micro">
                  <span class="t-grey">Progress</span>
                  <span class="t-medium">{{ sprint.completedCount }}/{{ sprint.taskCount }} tasks</span>
                </div>
                <div class="w-100 bg-light radius-round h-2r">
                  <div class="bg-main h-100 radius-round" :style="{ width: `${(sprint.completedCount / sprint.taskCount) * 100}%` }" />
                </div>
              </div>
            </div>

            <div class="flex flex-v-center gap-thin">
              <span class="p-small t-grey">Participants:</span>
              <div class="flex" style="margin-left: -0.5rem;">
                <img v-for="member in sprint.participants" :key="member.id" :src="member.avatar" :alt="member.name" :title="member.name" class="i-medium radius-extra br-2px br-white" style="margin-left: -0.5rem;" />
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <div class="bg-white radius-semi pd-semi mn-b-semi">
        <div class="flex flex-v-center gap-thin mn-b-semi">
          <IconAttach class="i-medium" :fill="'rgb(var(--grey))'" />
          <h3 class="p-semi t-medium">Links, Artifacts & Repositories</h3>
        </div>

        <div class="cols-3 gap-regular">
          <div v-if="initiative.repositories && initiative.repositories.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small">Repositories</h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(repo, index) in initiative.repositories" :key="index" :href="`https://github.com/${repo.path}`" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                {{ repo.path }}
              </a>
            </div>
          </div>

          <div v-if="initiative.links?.documentation && initiative.links.documentation.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small flex flex-v-center gap-thin">
              <IconFile class="i-small" :fill="'currentColor'" />
              Documentation
            </h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(link, index) in initiative.links.documentation" :key="index" :href="link" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                {{ link.split('/').pop() || 'Link' }}
              </a>
            </div>
          </div>

          <div v-if="initiative.links?.design && initiative.links.design.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small">Design</h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(link, index) in initiative.links.design" :key="index" :href="link" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                Figma
              </a>
            </div>
          </div>

          <div v-if="initiative.links?.cicd && initiative.links.cicd.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small">CI/CD</h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(link, index) in initiative.links.cicd" :key="index" :href="link" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                Pipelines
              </a>
            </div>
          </div>

          <div v-if="initiative.links?.monitoring && initiative.links.monitoring.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small">Monitoring</h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(link, index) in initiative.links.monitoring" :key="index" :href="link" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                Grafana
              </a>
            </div>
          </div>

          <div v-if="initiative.links?.analytics && initiative.links.analytics.length > 0" class="br-1px br-light radius-medium pd-medium">
            <h4 class="t-medium mn-b-small">Analytics</h4>
            <div class="flex flex-column gap-thin">
              <a v-for="(link, index) in initiative.links.analytics" :key="index" :href="link" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                Dashboard
              </a>
            </div>
          </div>
        </div>

        <div v-if="initiative.environments && initiative.environments.length > 0" class="mn-t-semi">
          <h4 class="t-medium mn-b-small">Environments</h4>
          <div class="cols-3 gap-regular">
            <div v-for="(env, index) in initiative.environments" :key="index" class="br-1px br-light radius-medium pd-medium">
              <div class="flex flex-justify-between flex-v-center mn-b-thin">
                <h5 class="t-medium">{{ env.name }}</h5>
                <span :class="`pd-micro pd-x-thin radius-regular p-micro t-medium ${
                  env.status === 'healthy' ? 'bg-green-small t-green-nice' : 'bg-red-small t-red-nice'
                }`">
                  {{ env.status }}
                </span>
              </div>
              <a :href="env.url" target="_blank" rel="noopener noreferrer" class="p-small t-main hover-t-main-semi flex flex-v-center gap-micro mn-b-micro">
                <IconOpenLink class="i-small" :fill="'currentColor'" />
                Open
              </a>
              <p class="p-micro t-grey">Version: {{ env.version }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showMilestoneForm" class="fixed inset-0 bg-dark-overlay flex flex-center flex z-50" @click.self="showMilestoneForm = false">
        <div class="bg-white radius-medium pd-semi w-max-30r">
          <div class="flex flex-justify-between flex-v-center mn-b-medium">
            <h3 class="h3 t-medium">Create Milestone</h3>
            <button @click="showMilestoneForm = false" class="t-grey hover-t-dark transition-cubic-in-out">
              <IconCross class="i-medium" :fill="'currentColor'" />
            </button>
          </div>
          <p class="p-regular t-grey t-center">Milestone creation form coming soon...</p>
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
