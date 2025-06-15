<template>
  <div class="pd-thin">
    <SectionPageTitle
      title="Members"
      @update:tabs_current="(update) => tab = update"
      :tabs_current="tab"
      :tabs="[
        { name: `Members (${organization.state.current.numberOfMembers || 0})`, value: 'members' },
        { name: 'Departments', value: 'departments' },
        { name: 'Invites', value: 'invites' }
      ]"
      :actions="[
        { method: openMembersAddPopup, label: 'Invite members' }
      ]"
      class="mn-b-small bg-light bg-light radius-medium pd-medium"
    />

    <Popup 
      title="Add members"
      @close-popup="closeMembersAddPopup" 
      :isPopupOpen="isOpenMembersAddPopup"
      class="bg-white w-min-30r w-max-30r radius-big pd-medium"
    >
      <MembersAdd 
        text="Please enter your email or phone number to send an invitation link:"
        :organization="organizationData"
        @send-invite="handleSendInvite"
      />
    </Popup>  

    <Feed
      v-if="tab === 'departments'"
      :states="{
        empty: {
          title: 'No Departments Found',
          description: 'Currently, there are no departments available.',
          action: 'Add department',
          callback:  () => $router.push(`/organizations/${route.params._id}/departments/create`)
        }
      }"
      :store="{
        read: (options) => departments.actions.read(options),
        state: null
      }"
      :options="{
        organization: route.params._id,
        user: auth.state.user._id,
      }"
      v-slot="{ 
        items 
      }"
    >
      <CardDepartment
        v-for="(department, index) in items"
        :key="index"
        :department="department"
        :organization="route.params._id"
        class="radius-semi bg-light pos-relative mn-b-thin"
      />

     </Feed>

      <router-link
         v-if="tab === 'departments' && departments.state.departments.length > 0"
        :to="{
          path: `/organizations/${route.params._id}/departments/create`
        }"
        class="d-block flex-center flex uppercase t-semi bg-main w-100 pd-small radius-extra"
      >
        Add department
      </router-link>

      <!-- Members -->
      <div 
         v-if="tab === 'members'"
        class="cols-1 gap-thin"
      >
        <Feed
          :search="true"
          :states="{
            empty: {
              title: 'No Members Found',
              description: 'Currently, there are no members.'
            },
          }"
          :store="{
            read: (options) => memberships.actions.read(options)
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
            @click="$router.push(`/profile/${member.user._id}`)" 
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
      <!-- Invites -->
      <div 
        v-if="tab === 'invites'"
      > 
        <Feed
          v-model:items="invitesState"
          :states="{
            empty: {
              title: 'No Invites Found',
              description: 'Currently, there are no members.'
            }
          }"
          :store="{
            read: (options) => invites.actions.read(options)
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
            v-for="invite in items" 
            :key="index" 
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
            class="h-4r w-100 bg-light radius-big flex-nowrap flex pd-medium"
          />
        </Feed>
      </div>
  
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Tab      from '@martyrs/src/components/Tab/Tab.vue'
import Block      from '@martyrs/src/components/Block/Block.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue';

import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue'
import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'

import MembersAdd from '@martyrs/src/modules/organizations/components/sections/MembersAdd.vue';

// Mobile Module
import Menu from '@martyrs/src/components/Menu/Menu.vue'
import MenuItem from '@martyrs/src/components/Menu/MenuItem.vue'

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
import CardDepartment from '@martyrs/src/modules/organizations/components/blocks/CardDepartment.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'

import * as auth      from '@martyrs/src/modules/auth/views/store/auth.js'
import * as globals      from '@martyrs/src/modules/globals/views/store/globals.js'
import * as invites from '@martyrs/src/modules/organizations/store/invites.js';
import * as memberships from '@martyrs/src/modules/organizations/store/memberships.js';
import * as organization  from '@martyrs/src/modules/organizations/store/organizations.js'
import * as departments from '@martyrs/src/modules/organizations/store/departments.js';

const route   = useRoute()
const router   = useRouter()
const organizationData = ref(null)

// Tab logic
const tab = ref('members')
// States
const invitesState = ref([])
// Popup
const isOpenMembersAddPopup = ref(false);

function openMembersAddPopup() {
  isOpenMembersAddPopup.value = true;
}

function closeMembersAddPopup() {
  isOpenMembersAddPopup.value = false;
}

onMounted(async () => {
  organizationData.value = (await organization.actions.read({_id: route.params._id, user: auth.state.user._id}))[0]
  ;
})

const FirstLevelDepartments = computed(() => {
  const departmentsState = departments.state.departments;

  const subdepartmentIds = departmentsState.flatMap(department =>
    department.subdepartments.map(subdepartment => subdepartment._id)
  );

  return departmentsState.filter(department =>
    !subdepartmentIds.includes(department._id)
  );
});

async function handleSendInvite(list, resolve, reject) {
  try {
    const response = await invites.actions.create({
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
    for (let invite of response.createdInvites) {
      globals.actions.add(invitesState.value, invite)
    }
    closeMembersAddPopup();
    resolve(); // Вызываем resolve, когда все операции завершены успешно
  } catch (error) {
    reject(error); // Вызываем reject, если произошла ошибка
  }
}

async function removeMember(index,member) {
  if (confirm("Confirm remove of member") == true) {
    memberships.state.memberships.splice(index, 1);
    await memberships.actions.delete(member);
  } 
}

async function removeInvite(index,invite) {
  if (confirm("Confirm remove of member") == true) {
    globals.actions.delete(invitesState.value, invite)
    await invites.actions.delete(invite._id);
  }
}
</script>

<style scoped>
</style>
