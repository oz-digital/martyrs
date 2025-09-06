<template>
  <div class="">

    <div class="pd-medium w-100">

      <h3 
        class="mn-b-small w-100"
        v-html="department.profile.name"
      />
    
      <ul>
        <li v-if="department.members.length < 1">No members in department</li>
        <User 
          class="h-4r pd-small br-solid br-1px br-black-transp-5 radius-small mn-b-thin" 
          v-for="(member, index) in department.members" 
          :key="index" 
          :user="member.user" 
          :photo="member.user.profile.photo"
          :name="member.user.profile.name || member.user.phone || member.user.email || member.user._id"
          :position="member.position" 
          @click="$router.push({ name: 'User Profile', params: { _id: member.user._id } })" 
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'

import Spoiler  from '@martyrs/src/components/Spoiler/Spoiler.vue';
import { DepartmentSub } from '@martyrs/src/modules/organizations/organizations.client.js';
import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';

const props = defineProps({
  department: Object,
  organization: Object
});
</script>
<style scoped>
.subdepartmentsartment {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}
</style>