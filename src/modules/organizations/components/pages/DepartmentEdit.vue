<template>
  <div class="for-transition pd-thin w-100">

    <header class="mn-b-thin flex-nowrap flex-v-center flex bg-light pd-medium radius-medium">
      <h1 v-if="route.params.department" class="mn-r-auto">Edit Department</h1>
      <h1 v-else class="mn-r-auto">Create Department</h1>

      <section class="flex-nowrap flex gap-thin pd-thin">
        <Button v-if="route.params.department"   :submit="onDelete" :callback="redirectToDash" class="bg-red">Delete</Button>
        <Button :submit="onSubmit" :callback="redirectTo" class="bg-main">Save</Button>
      </section>

    </header>
    
    <Block
      title="Profile"
      v-if="departmentsStore.state.department.profile"
      class="mn-b-thin"
    >
      <div
        class="cols-2-fit-content"
      >
        <UploadImage 
           v-model:photo="departmentsStore.state.department.profile.photo"
          :uploadPath="'organizations/' + departmentsStore.state.department.name + '/avatars'"
          class="w-8r aspect-1x1 o-hidden mn-r-small radius-extra" 
        />
        <div class="w-100 flex-child-grow-1 flex-child ">
          <Field 
            v-model:field="departmentsStore.state.department.profile.name"     
            label="Name"  
            placeholder="Department Name" 
            class="mn-b-small bg-white radius-small pd-medium"
            :validation="organizationName" 
          />
          <Field 
            v-model:field="departmentsStore.state.department.profile.description"     
            label="Description"  
            placeholder="Department description (max 120 symbols)" 
            class="bg-white radius-small pd-medium"
            :validation="organizationName" 
          />  
        </div>
      </div>
    </Block>

    <Block
      title="Team"
      placeholder="No members added yet"
      :actions="[{
        label: '+',
        function: () => openMemberPopup()
      }]"
      class="cols-1 gap-thin mn-b-thin"
    > 
      <CardUser 
        class="h-4r bg-white pd-thin radius-medium w-100" 
        v-for="(member, index) in departmentsStore.state.department.members" 
        :key="index" 
        :user="member.user" 
        :photo="member.user.profile.photo"
        :name="member.user.profile.name || member.user.phone || member.user.email || member.user._id"
        :position="member.position" 
        :action="{
          label: {
            is: IconDelete,
            props: { class: 'i-medium', fill: 'rgb(var(--white)' }
          },
          method: () => removeMember(member)
        }"
      />
    </Block>

    <Popup 
      title="Add member" 
      @close-popup="closeMemberPopup" 
      :isPopupOpen="isOpenAddMemberPopup"
      class="bg-white w-max-30r radius-medium pd-big"
    >
      <Feed
        :search="{
          placeholder: 'Search customer...',
          class: 'bg-light mn-b-thin'
        }"
        :states="{
          empty: {
            title: 'No Members Found',
            description: 'Currently, there are no members in organization.'
          }
        }"
        :store="{
          read: (options) => memberships.actions.read(options),
          state: null
        }"
        :options="{
          target: route.params._id,
          role: ['member']
        }"
        v-slot="{ 
          items 
        }"
        class="bg-light pd-medium w-min-20r w-max-40r radius-medium h-max-20r o-scroll"
      >
        <CardUser
          v-for="(user, index) in items" 
          :key="user._id"
          :user="user.user"
          :photo="user.user.profile?.photo"
          :name="user.user.profile?.name || user.user.phone || user.user.email"
          @click="() => { 
            core.actions.add(departmentsStore.state.department.members, { _id: user.user._id, user: user.user, position: 'Member'})
            closeMemberPopup();
          }"
          class="h-4r bg-white pd-thin radius-medium w-100 mn-b-thin"
        />
      </Feed>
    </Popup>
      

    <div class="cols-2 gap-thin">
    
        <div class="bg-light pd-medium o-hidden radius-medium">
          <h3 class="mn-b-semi">Department Settings</h3>
          
          <p class="p-regular mn-b-small">Please settings for your department:</p>
          <div class="cols-1 gap-thin">
            <Checkbox 
              label="Hidden department"
              name="hidden"
              class="w-100 mn-r-small bg-white radius-small pd-small"
              @update:radio="updated => departmentsStore.state.department.hidden = !departmentsStore.state.department.hidden"
              :radio="departmentsStore.state.department.hidden"
            />
          </div>
        </div>

        <div class="bg-light pd-medium o-hidden radius-medium">
          <h3 class="mn-b-semi">Acessess</h3>
          
          <p class="p-regular mn-b-small">Please select organization accesses for user in department:</p>
          
          <div class="cols-1 gap-thin">
            <div v-for="(actions, category) in departmentsStore.state.department.accesses" :key="category">
              <h4>{{ category.charAt(0).toUpperCase() + category.slice(1) }}</h4>
              <Checkbox
                v-for="(value, action) in actions"
                :key="action"
                :label="action"
                :name="action"
                :radio="value"
                @update:radio="updated => (departmentsStore.state.department.accesses[category][action] = !value)"
                class="w-100 mn-r-small bg-white radius-small pd-small"
              />
            </div>
          </div>
        </div>


      </div>

  
    


<!--     <div id="dash" class="pd-medium bg-white">

      <Popup title="Добавить подотдел" @close-popup="closeDepartmentPopup" :isPopupOpen="isOpenDepartmentPopup">
        <DepartmentSubDepartmentModify 
          :departments="departmentsStore.state.department.subdepartments" 
          :department="selectedDepartment" 
          :maindepartment="departmentsStore.state.department"
          :alldepartments="departmentsStore.state.departments"
          @callback="closeDepartmentPopup"
        />
      </Popup>
    
      <div class="mn-b-regular  flex-v-center flex-nowrap flex">
        <h3 class="mn-r-small">Подотделы </h3>
        <div>
          <a  class="t-main h5" @click="openDepartmentPopup()">+</a>
        </div>
      </div>

        <ul class="mn-b-small">
          <li v-if="departmentsStore.state.department.subdepartments.length < 1">В отделе еще нет подотделов</li>
          <DepartmentSub  
            v-for="(subdepartment, index) in departmentsStore.state.department.subdepartments" 
            :key="index" class="bg-light o-hidden radius-small mn-b-thin" 
            :department="subdepartment" 
              @click="openDepartmentPopup(index)"
            />
        </ul> 

      
    </div> -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Cookies from "js-cookie";
import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';

import Tab from "@martyrs/src/components/Tab/Tab.vue";
import Field from "@martyrs/src/components/Field/Field.vue";
import Select from "@martyrs/src/components/Select/Select.vue";
import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue";
import Address from "@martyrs/src/components/Address/Address.vue";
import LocationMarker from "@martyrs/src/components/LocationMarker/LocationMarker.vue";
import Button from "@martyrs/src/components/Button/Button.vue";
import Popup from "@martyrs/src/components/Popup/Popup.vue";
import Block from '@martyrs/src/components/Block/Block.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue'

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'

import { 
  DepartmentSub, 
  departmentsStore, 
  membershipsStore 
} from "@martyrs/src/modules/organizations/organizations.client.js";

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

import * as globals from "@martyrs/src/modules/core/views/store/core.store.js";

const router = useRouter();
const route = useRoute();

async function fetchData() {
  const users = ref(membershipsStore.state.items);
  // await departmentsStore.read({organization: route.params._id});
  if (route.params.department) await departmentsStore.read({ _id: route.params.department });
}

fetchData();

// const members = ref(departmentsStore.state.department.members);

const isOpenAddMemberPopup = ref(false);
const selectedMember = ref(null);

function openMemberPopup(member) {
  isOpenAddMemberPopup.value = true;
  if (typeof member === "number") selectedMember.value = member;
}

function closeMemberPopup() {
  isOpenAddMemberPopup.value = false;
  selectedMember.value = null;
}

const isOpenDepartmentPopup = ref(false);
const selectedDepartment = ref(null);

function openDepartmentPopup(department) {
  isOpenDepartmentPopup.value = true;
  if (typeof department === "number") selectedDepartment.value = department;
}

function closeDepartmentPopup() {
  isOpenDepartmentPopup.value = false;
  selectedDepartment.value = null;
}

async function onSubmit() {
  if (route.params.department) {
    await departmentsStore.update(
      route.params._id,
      departmentsStore.state.department
    );
  }
  if (!route.params.department) {
    await departmentsStore.create(
      route.params._id,
      departmentsStore.state.department
    );
  }
}

function redirectTo() {
  router.push({ name: "Organization Members", params: { _id: route.params._id } });
}

async function onDelete() {
  if (confirm("Are you sure you want to delete this department?")) {
    await departmentsStore.delete(
      route.params._id,
      departmentsStore.state.department
    );
  }
  
}

function removeMember(member) {
   if (confirm("Are you sure you want to remove this member?")) {
    core.actions.delete(departmentsStore.state.department.members, { _id: member.user._id}) 
  }
}

function redirectDash() {
  router.replace({ name: "Organization" });
}
</script>

<style scoped>
</style>