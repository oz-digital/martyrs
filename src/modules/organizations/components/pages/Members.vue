<template>
  <div class="pd-thin">
    <div v-if="!isLoaded" class="flex-center flex h-20r">
      <span class="t-transp">Loading...</span>
    </div>
    <div v-else>
    <!-- Members Section -->
    <section class="mn-b-medium">
      <SectionPageTitle
        :title="`Members ${organizationData?.numberOfMembers ? `(${organizationData.numberOfMembers})` : ''}`"
        :actions="[
          { method: openAddUsersPopup, label: 'Add user to organization' }
        ]"
        class="mn-b-small bg-light radius-medium pd-medium"
      />

      <div class="cols-1 gap-thin">
        <Feed
          v-model:items="membersList"
          :search="true"
          :states="{
            empty: {
              title: 'No Members Found',
              description: 'Currently, there are no members.'
            },
          }"
          :store="{
            read: (options) => membershipsStore.read(options)
          }"
          :options="{
            target: route.params._id,
            role: ['member','owner']
          }"
          v-slot="{ 
            items 
          }"
          class="gap-thin cols-1"
        >
          <CardUser 
            v-for="(member,index) in items" 
            :key="index" 
            :user="member"
            :_id="member.user._id"
            :photo="member.user.profile.photo" 
            :phone="member.user.phone"
            :email="member.user.email"
            :name="member.user.profile.name || 'No name'"
            :role="member.label || member.role"
            @click="$router.push({ name: 'User Profile', params: { _id: member.user._id } })" 
            :action=" member.role !== 'owner' ? {
              label: {
                is: IconDelete,
                props: { class: 'i-medium', fill: 'rgb(var(--white)' }
              },
              method: () => removeMember(index, member)
            } : null"
            class="h-4r w-100 bg-light radius-medium flex-nowrap flex pd-medium"
          />
        </Feed>
      </div>
    </section>

    <!-- Departments Section -->
    <section class="mn-b-medium">
      <SectionPageTitle
        title="Departments"
        :actions="[
          { method: () => openDepartmentPopup(), label: 'Add department' }
        ]"
        class="mn-b-small bg-light bg-light radius-medium pd-medium"
      />

      <Feed
        v-model:items="departmentsList"
        :states="{
          empty: {
            title: 'No Departments Found',
            description: 'Currently, there are no departments available.'
          }
        }"
        :store="departmentsStore"
        :options="{
          organization: route.params._id,
          user: auth.state.user._id,
        }"
        v-slot="{ 
          items 
        }"
      >
        <div
          v-for="(department, index) in items"
          :key="department._id"
          @click="() => openDepartmentPopup(department)"
          class="cursor-pointer hover-scale-1"
        >
          <CardDepartment
            :department="department"
            :organization="route.params._id"
            class="radius-semi bg-light pos-relative mn-b-thin"
          />
        </div>
      </Feed>
    </section>

    <!-- Invites Section -->
    <section>
      <SectionPageTitle
        title="Invites"
        :actions="[
          { method: openInvitePopup, label: 'Invite members' }
        ]"
        class="mn-b-small bg-light bg-light radius-medium pd-medium"
      />

      <Feed
        v-model:items="invitesList"
        :states="{
          empty: {
            title: 'No Invites Found',
            description: 'Currently, there are no pending invites.'
          }
        }"
        :store="{
          read: (options) => invitesStore.read(options)
        }"
        :options="{
          owner: route.params._id
        }"
        v-slot="{ 
          items 
        }"
        class="gap-thin cols-1"
      >
        <CardUser 
          v-for="(invite, index) in items" 
          :key="invite._id" 
          :user="{ type: 'invite'} "
          :name="invite.email || invite.phone"
          :role="invite.status"
          :action="{
            label: {
              is: IconDelete,
              props: { class: 'i-medium', fill: 'rgb(var(--white)' }
            },
            method: () => removeInvite(index, invite)
          }"
          class="h-4r w-100 bg-light radius-medium flex-nowrap flex pd-medium"
        />
      </Feed>
    </section>

    <!-- Invite Members Popup -->
    <Popup 
      title="Invite members"
      @close-popup="closeInvitePopup" 
      :isPopupOpen="isOpenInvitePopup"
      class="bg-white w-min-30r w-max-30r radius-medium pd-medium"
    >
      <InviteForm 
        v-if="organizationData"
        :organization="organizationData"
        @send-invite="handleSendInvite"
      />
    </Popup>

    <!-- Add Existing Users Popup -->
    <Popup 
      title="Add users to organization"
      @close-popup="closeAddUsersPopup" 
      :isPopupOpen="isOpenAddUsersPopup"
      class="bg-white w-min-40r w-max-50r radius-medium pd-medium"
    >
      <AddExistingMembersForm 
        :organizationId="route.params._id"
        @users-added="handleUsersAdded"
      />
    </Popup>

    <!-- Department Edit Popup -->
    <Popup
      :title="editingDepartment ? 'Edit Department' : 'Create Department'"
      @close-popup="closeDepartmentPopup"
      :isPopupOpen="isDepartmentPopupOpen"
      align="center right"
      class="bg-white h-min-100 w-max-50r pd-medium"
    >
      <DepartmentForm
        :department="editingDepartment"
        :organizationId="route.params._id"
        @close="closeDepartmentPopup"
        @saved="handleDepartmentSaved"
      />
    </Popup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';

import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue';

import { 
  InviteForm,
  AddExistingMembersForm,
  DepartmentForm,
  CardDepartment,
  departmentsStore,
  membershipsStore,
  invitesStore,
  storeOrganizations as organization
} from '@martyrs/src/modules/organizations/organizations.client.js';

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';

const route = useRoute();
const router = useRouter();

// Data
const organizationData = ref(null);
const membersList = ref([]);
const invitesList = ref([]);
const departmentsList = ref([]);
const isLoaded = ref(false);

// Popups state
const isOpenInvitePopup = ref(false);
const isOpenAddUsersPopup = ref(false);
const isDepartmentPopupOpen = ref(false);
const editingDepartment = ref(null);

// Popup functions
function openInvitePopup() {
  isOpenInvitePopup.value = true;
}

function closeInvitePopup() {
  isOpenInvitePopup.value = false;
}

function openAddUsersPopup() {
  isOpenAddUsersPopup.value = true;
}

function closeAddUsersPopup() {
  isOpenAddUsersPopup.value = false;
}

function openDepartmentPopup(department = null) {
  editingDepartment.value = department;
  isDepartmentPopupOpen.value = true;
}

function closeDepartmentPopup() {
  isDepartmentPopupOpen.value = false;
  editingDepartment.value = null;
}

// Load organization data
onMounted(async () => {
  try {
    const response = await organization.actions.read({
      _id: route.params._id, 
      user: auth.state.user._id
    });
    organizationData.value = response[0];
    isLoaded.value = true;
  } catch (error) {
    console.error('Error loading organization:', error);
    isLoaded.value = true; // Still show the page even if organization load fails
  }
});

// Handlers
async function handleSendInvite(list, resolve, reject) {
  try {
    const response = await invitesStore.create({
      owner: {
        type: 'Organization',
        target: organizationData.value._id
      },
      creator: {
        type: 'User',
        target: auth.state.user._id
      },
      invites: list,
    });
    
    // Assuming the API returns an array of created invites
    if (response.createdInvites) {
      for (let invite of response.createdInvites) {
        invitesStore.addItem(invite, invitesList.value);
      }
    } else if (response._id) {
      // Single invite created
      invitesStore.addItem(response, invitesList.value);
    }
    
    closeInvitePopup();
    resolve();
  } catch (error) {
    reject(error);
  }
}

function handleUsersAdded(addedUsers) {
  closeAddUsersPopup();
  // Add new members to the list
  if (addedUsers && addedUsers.length > 0) {
    addedUsers.forEach(membership => {
      membershipsStore.addItem(membership, membersList.value);
    });
  }
}

function handleDepartmentSaved(department) {
  closeDepartmentPopup();
  
  console.log('handleDepartmentSaved called with:', department);
  console.log('departmentsList before update:', departmentsList.value);
  console.log('editingDepartment:', editingDepartment.value);
  
  if (department) {
    // Update or add department in the list
    if (editingDepartment.value) {
      departmentsStore.updateItem(department, departmentsList.value);
    } else {
      departmentsStore.addItem(department, departmentsList.value);
    }
  } else {
    // Department was deleted
    if (editingDepartment.value) {
      departmentsStore.removeItem(editingDepartment.value, departmentsList.value);
    }
  }
  
  console.log('departmentsList after update:', departmentsList.value);
}

async function removeMember(index, member) {
  if (confirm("Confirm remove of member") == true) {
    await membershipsStore.delete(member);
    membershipsStore.removeItem(member, membersList.value);
  } 
}

async function removeInvite(index, invite) {
  if (confirm("Confirm remove of invite") == true) {
    await invitesStore.delete(invite);
    invitesStore.removeItem(invite, invitesList.value);
  }
}
</script>

<style scoped>
</style>