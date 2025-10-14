<template>
  <div class="cols-1 gap-thin o-y-scroll">
    <Block
      title="Profile"
      class="mn-b-thin"
    >
      <div
        class="cols-2-fit-content"
      >
        <UploadImage 
          v-model:photo="currentDepartment.profile.photo"
          :uploadPath="'organizations/' + currentDepartment.profile.name + '/departments'"
          class="w-8r aspect-1x1 o-hidden mn-r-small radius-extra" 
        />
        <div class="w-100 flex-child-grow-1 flex-child">
          <Field 
            v-model:field="currentDepartment.profile.name"     
            label="Name"  
            placeholder="Department Name" 
            class="mn-b-small bg-white radius-small pd-medium"
          />
          <Field 
            v-model:field="currentDepartment.profile.description"     
            label="Description"  
            placeholder="Department description (max 120 symbols)" 
            class="bg-white radius-small pd-medium"
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
        v-for="(member, index) in currentDepartment.members" 
        :key="member._id || index" 
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

    <div class="bg-light pd-medium o-hidden radius-medium mn-b-thin">
      <h3 class="mn-b-semi">Department Settings</h3>
      
      <p class="p-regular mn-b-small">Please settings for your department:</p>
      <div class="cols-1 gap-thin">
        <Checkbox 
          label="Hidden department"
          name="hidden"
          class="w-100 mn-r-small bg-white radius-small pd-small"
          @update:radio="updated => currentDepartment.hidden = !currentDepartment.hidden"
          :radio="currentDepartment.hidden"
        />
      </div>
    </div>

    <div class="bg-light pd-medium o-hidden radius-medium">
      <h3 class="mn-b-semi">Accesses</h3>
      
      <p class="p-regular mn-b-small">Please select organization accesses for user in department:</p>
      
      <div class="cols-1 gap-thin">
        <div v-for="(actions, category) in currentDepartment.accesses" :key="category" class="mn-b-small">
          <Spoiler :status="false">
            <template #header="{ isOpen }">
              <h4 class="cursor-pointer flex-v-center flex gap-thin">
                {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                <span class="t-small">{{ isOpen ? '▼' : '▶' }}</span>
              </h4>
            </template>
            <template #content>
              <div class="cols-1 gap-thin mn-t-thin">
                <Checkbox
                  v-for="(value, action) in actions"
                  :key="action"
                  :label="action"
                  :name="action"
                  :radio="value"
                  @update:radio="updated => (currentDepartment.accesses[category][action] = !value)"
                  class="w-100 mn-r-small bg-white radius-small pd-small"
                />
              </div>
            </template>
          </Spoiler>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-thin mn-t-medium">
      <Button
        v-if="editingDepartment"
        :submit="onDelete"
        :showSuccess="true"
        :showLoader="true"
        class="bg-red"
      >
        Delete
      </Button>
      <Button
        :showSuccess="false"
        :showLoader="false"
        class="bg-grey t-white w-100"
        @click="$emit('close')"
      >
        Cancel
      </Button>
      <Button
        class="bg-main w-100"
        :submit="saveDepartment"
      >
        {{ editingDepartment ? 'Update Department' : 'Create Department' }}
      </Button>
    </div>

    <!-- Member Selection Popup -->
    <Popup 
      title="Add member" 
      @close-popup="closeMemberPopup" 
      :isPopupOpen="isOpenAddMemberPopup"
      class="bg-white w-max-30r radius-medium pd-big"
    >
      <Feed
        :search="{
          placeholder: 'Search member...',
          class: 'bg-light mn-b-thin'
        }"
        :states="{
          empty: {
            title: 'No Members Found',
            description: 'Currently, there are no members in organization.'
          }
        }"
        :store="{
          read: (options) => membershipsStore.read(options),
          state: null
        }"
        :options="{
          target: organizationId,
          role: ['member', 'owner']
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
          :disabled="isDuplicateMember(user.user._id)"
          @click="() => addMemberToDepartment(user.user)"
          class="h-4r bg-white pd-thin radius-medium w-100 mn-b-thin"
          :class="{ 'opacity-50 cursor-not-allowed': isDuplicateMember(user.user._id) }"
        />
      </Feed>
    </Popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';

import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Spoiler from '@martyrs/src/components/Spoiler/Spoiler.vue';

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';

const store = useStore();
import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js';
import departmentsStore from '@martyrs/src/modules/organizations/store/departments.store.js';

const route = useRoute();

const props = defineProps({
  department: Object,
  organizationId: String
});

const emit = defineEmits(['close', 'saved']);

// State
const editingDepartment = computed(() => !!props.department?._id);
const isOpenAddMemberPopup = ref(false);

// Create default department structure
const createDefaultDepartment = () => ({
  organization: props.organizationId,
  profile: {
    photo: '',
    name: '',
    description: '',
    categories: [],
  },
  address: '',
  location: {
    lat: null,
    lng: null,
  },
  worktime: [],
  delivery: [],
  payment: [],
  members: [],
  subdepartments: [],
  hidden: false,
  accesses: {
    categories: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    rents: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    spots: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    members: {
      read: false,
      edit: false,
      delete: false,
    },
    posts: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    events: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    tickets: {
      create: false,
      read: false,
      edit: false,
      delete: false,
    },
    gallery: {
      read: false,
      create: false,
      edit: false,
      delete: false,
    },
    inventory: {
      read: false,
      edit: false,
      delete: false,
    },
    products: {
      read: false,
      edit: false,
      delete: false,
    },
    orders: {
      read: false,
      confirm: false,
      delete: false,
    },
    departments: {
      read: false,
      edit: false,
      delete: false,
    },
  },
});

// Current department reactive state - create deep copy to avoid mutating original
const currentDepartment = reactive(
  props.department ? JSON.parse(JSON.stringify(props.department)) : createDefaultDepartment()
);

// Member management
function openMemberPopup() {
  isOpenAddMemberPopup.value = true;
}

function closeMemberPopup() {
  isOpenAddMemberPopup.value = false;
}

function isDuplicateMember(userId) {
  return currentDepartment.members.some(member => 
    member.user._id === userId || member._id === userId
  );
}

function addMemberToDepartment(user) {
  if (!isDuplicateMember(user._id)) {
    currentDepartment.members.push({ 
      _id: user._id, 
      user: user, 
      position: 'Member' 
    });
    closeMemberPopup();
  } else {
    store.core.actions.setError({ message: 'This user is already a member of this department' });
  }
}

function removeMember(member) {
  if (confirm("Are you sure you want to remove this member?")) {
    const index = currentDepartment.members.findIndex(m => 
      (m.user._id === member.user._id) || (m._id === member._id)
    );
    if (index > -1) {
      currentDepartment.members.splice(index, 1);
    }
  }
}

// Save/Delete operations
async function saveDepartment() {
  try {
    // Prepare department data
    const departmentData = {
      ...currentDepartment,
      organization: props.organizationId
    };

    let result;
    if (editingDepartment.value) {
      // Update existing department
      result = await departmentsStore.update({
        ...departmentData,
        _id: props.department._id
      });
    } else {
      // Create new department
      result = await departmentsStore.create(departmentData);
    }

    emit('saved', result);
    emit('close');
  } catch (error) {
    console.error('Error saving department:', error);
    store.core.actions.setError(error);
    throw error;
  }
}

async function onDelete() {
  if (confirm("Are you sure you want to delete this department?")) {
    try {
      await departmentsStore.delete({ _id: props.department._id });
      emit('saved', null);
      emit('close');
    } catch (error) {
      console.error('Error deleting department:', error);
      store.core.actions.setError(error);
    }
  }
}
</script>
