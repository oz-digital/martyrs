<template>
  <div>
    <p class="mn-b-thin t-transp p-regular">Select users to add to the organization:</p>

    <Feed
      :search="{
        placeholder: 'Search users...',
        class: 'bg-light mn-b-thin'
      }"
      :states="{
        empty: {
          title: 'No Users Found',
          description: 'No users match your search criteria.'
        },
        loading: {
          title: 'Loading users...'
        }
      }"
      :store="{
        read: (options) => fetchFilteredUsers(options),
        state: null
      }"
      :options="{}"
      v-slot="{ items }"
      class="bg-light pd-medium radius-medium h-max-30r o-scroll mn-b-thin"
    >
      <div
        v-for="user in items"
        :key="user._id"
        @click="() => toggleUserSelection(user)"
        class="pd-thin radius-medium w-100 mn-b-thin cursor-pointer hover-scale-1"
        :class="getUserCardClass(user)"
      >
        <div class="flex-nowrap flex-v-center flex gap-thin">
          <div class="aspect-1x1 h-3r flex-child-default radius-small o-hidden">
            <img
              v-if="user.profile?.photo"
              :src="user.profile.photo"
              alt="User photo"
              class="w-100 h-100 object-fit-cover"
            />
            <PlaceholderUserpic v-else class="w-100 h-100" />
          </div>
          
          <div class="w-100">
            <p class="t-medium">{{ user.profile?.name || user.phone || user.email || 'Unnamed user' }}</p>
            <p class="t-small t-transp">{{ user.email || user.phone || 'No contact info' }}</p>
          </div>

          <div v-if="isUserInOrganization(user)" class="pd-nano pd-h-thin radius-thin bg-grey">
            <span class="t-small">Already member</span>
          </div>
          
          <div v-else-if="isUserSelected(user)" class="pd-nano pd-h-thin radius-thin bg-green">
            <IconCheck class="i-small" fill="rgb(var(--white))" />
          </div>
        </div>
      </div>
    </Feed>

    <div v-if="selectedUsers.length > 0" class="mn-b-thin">
      <p class="t-small t-transp">Selected: {{ selectedUsers.length }} user(s)</p>
    </div>

    <Button
      :submit="addSelectedUsers"
      :disabled="selectedUsers.length === 0"
      class="w-100 bg-main"
    >
      Add {{ selectedUsers.length }} user(s) to organization
    </Button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import Button from '@martyrs/src/components/Button/Button.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue';
import IconCheck from '@martyrs/src/modules/icons/navigation/IconCheck.vue';

import * as users from '@martyrs/src/modules/auth/views/store/users.js';
import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js';
import * as core from '@martyrs/src/modules/core/views/store/core.store.js';

const props = defineProps({
  organizationId: {
    type: String,
    required: true
  },
  existingMembers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['users-added']);

// State
const selectedUsers = ref([]);
const organizationMembers = ref([]);

// Check if user is already in organization
function isUserInOrganization(user) {
  return organizationMembers.value.some(member => 
    member.user._id === user._id || member.user === user._id
  );
}

// Check if user is selected
function isUserSelected(user) {
  return selectedUsers.value.some(selected => selected._id === user._id);
}

// Get card styling based on user status
function getUserCardClass(user) {
  if (isUserInOrganization(user)) {
    return 'bg-grey opacity-60 cursor-not-allowed';
  }
  if (isUserSelected(user)) {
    return 'bg-green-light';
  }
  return 'bg-white hover-bg-light';
}

// Toggle user selection
function toggleUserSelection(user) {
  if (isUserInOrganization(user)) {
    core.actions.setError({ message: 'This user is already a member of the organization' });
    return;
  }

  const index = selectedUsers.value.findIndex(u => u._id === user._id);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(user);
  }
}

// Fetch users and organization members
async function fetchFilteredUsers(options) {
  try {
    // Fetch organization members
    const membersResponse = await membershipsStore.read({
      target: props.organizationId,
      role: ['member', 'owner']
    });
    organizationMembers.value = membersResponse || [];

    // Fetch all users
    const usersResponse = await users.actions.read(options);
    return usersResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Add selected users to organization
async function addSelectedUsers() {
  if (selectedUsers.value.length === 0) return;

  try {
    const promises = selectedUsers.value.map(user => 
      membershipsStore.create({
        user: user._id,
        type: 'organization',
        target: props.organizationId,
        role: 'member',
        label: 'member'
      })
    );

    const results = await Promise.all(promises);
    
    emit('users-added', results);
    selectedUsers.value = [];
    
    core.actions.setSuccess({ 
      message: `Successfully added ${results.length} user(s) to the organization` 
    });
  } catch (error) {
    console.error('Error adding users:', error);
    core.actions.setError(error);
    throw error;
  }
}
</script>