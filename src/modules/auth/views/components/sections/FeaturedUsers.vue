<template>
  <div class="o-hidden w-100">
    <div class="flex-center flex w-100">
      <h2 class="t-center h2 w-max-50r mn-b-big">
        Ask the hundreds shaping your entertainment for decades
      </h2>
    </div>
    <Marquee
      class="mn-b-thin"
      :gradient="true"
      :gradientColor="'var(--white)'"
      :gradientLength="'10%'"
      :direction="'normal'"
      :pauseOnHover="false"
      :clone="true"
    >
      <div class="flex flex-nowrap">
        <CardUser 
          v-for="user in usersList.slice(0,6)" 
          class="mn-r-thin h4 h-8r flex-child-grow-0 flex-child bg-light pd-small radius-medium"
          :user="user" 
          :photo="user.profile.photo"
          :name="user.profile.name || user.phone || user.username"
          :phone="'DJ'"
        /> 
      </div>
    </Marquee>

    <Marquee
      class="mn-b-thin"
      :gradient="true"
      :gradientColor="'var(--white)'"
      :gradientLength="'10%'"
      :direction="'reverse'"
      :pauseOnHover="false"
      :clone="true"
    >
      <div class="flex flex-nowrap">
        <CardUser 
          v-for="user in usersList.slice(7,14)" 
          class="mn-r-thin h4 h-8r flex-child-grow-0 flex-child bg-light pd-small radius-medium"
          :user="user" 
          :photo="user.profile.photo"
          :name="user.profile.name || user.phone || user.username"
          :phone="'DJ'"
        /> 
      </div>
    </Marquee>

    <Marquee
      class="mn-b-big"
      :gradient="true"
      :gradientColor="'var(--white)'"
      :gradientLength="'10%'"
      :direction="'normal'"
      :pauseOnHover="false"
      :clone="true"
    >
      <div class="flex flex-nowrap">
        <CardUser 
          v-for="user in usersList.slice(15,22)" 
          class="mn-r-thin h4 h-8r flex-child-grow-0 flex-child bg-light pd-small radius-medium"
          :user="user" 
          :photo="user.profile.photo"
          :name="user.profile.name || user.phone || user.username"
          :phone="'DJ'"
        /> 
      </div>
    </Marquee>

    <p class="w-m-33r mn-r-auto mn-l-auto t-center mn-b-small p-big">
      Together, we're shaping the future of the globals music community.
    </p>
    <router-link :to="{ name: 'Sign In' }" class="bg-black w-max mn-r-auto mn-l-auto t-medium t-white button">
      Join Now
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import * as users from '@martyrs/src/modules/auth/views/store/users.js'

import Marquee from '@martyrs/src/components/Marquee/Marquee.vue'

import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

const usersList = ref([])

onMounted(async() => {
  usersList.value = await users.actions.read({
    limit: 25
  })
});
</script>

<style lang="scss">
  .selector {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
  }
</style>
