<template>
  <div class="for-transition w-100">
    
    <div v-if="departments.state.department" id="dash" class="pd-medium bg-light">
      <section class="mn-b-medium radius-medium pd-semi bg-white">
         <div class="flex-nowrap flex mn-b-small">

          <h2 class="w-100">{{ departments.state.department.profile.name }}</h2>

          <router-link 
            :to="{
              name: 'Department Edit', 
              params: {
                _id: route.params._id,
                department: route.params.department
              }
            }" 
            class="
              cursor-pointer 
              pos-absolute pos-t-regular pos-r-regular
              radius-extra pd-thin bg-second
            "
          >
            <IconEdit
              class="i-regular"
              classes="fill-white"
            />
          </router-link>

        </div>
        <p class="t-transp p-big" v-html="departments.state.department.description"></p>
      </section>

     <section class="mn-b-medium radius-medium pd-semi bg-white">
        <h3 class="mn-b-regular">Команда</h3>
        <ul>
          <li v-if="departments.state.department.members.length < 1">В отделе еще нет участников</li>
          <User 
            class="br-b br-solid br-grey-transp-25" 
            v-for="(member, index) in departments.state.department.members" 
            :key="index" 
            :user="member.user" 
            :photo="member.user.profile.photo"
            :name="member.user.profile.name || member.user.phone || member.user.email || member.user._id"
            :position="member.position" 
            @click="$router.push(`/app/profile/${member.user._id}`)" 
          />
        </ul>
      </section>

      <section class="mn-b-medium radius-medium pd-semi bg-white">
        <h3 class="mn-b-regular">Подотделы</h3>
        <ul>
          <li v-if="departments.state.department.subdepartments.length < 1">В отделе еще нет подотделов</li>
          <DepartmentSub v-for="(subdepartment, index) in departments.state.department.subdepartments" @click="$router.push(`/app/organization/departments/${subdepartment._id}`)" :key="index" class="br-b br-solid br-grey-transp-25" :department="subdepartment" />
        </ul> 
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

import Spoiler from '@martyrs/src/components/Spoiler/Spoiler.vue';
import DepartmentSub from '@martyrs/src/modules/organizations/components/blocks/DepartmentSub.vue';
import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';
import * as departments from '@martyrs/src/modules/organizations/store/departments.js';

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'

const router = useRouter();
const route = useRoute();

await departments.actions.readOne(route.params.department);
</script>

<style scoped>
</style>
