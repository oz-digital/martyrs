<template>
  <nav class="flex flex-column mobile:flex-row bg-light pd-medium radius-small">
    <RouterLink 
      :to="{ name: 'Profile Edit Profile', params: { _id: userId } }"
      class="flex flex-v-center pd-small mn-b-thin radius-small hover:bg-white"
      :class="{ 'bg-white': route.name === 'Profile Edit Profile' }"
    >
      <IconProfile class="mn-r-thin i-medium"/>
      <span>Profile</span>
    </RouterLink>
    
    <RouterLink 
      :to="{ name: 'Profile Edit Account', params: { _id: userId } }"
      class="flex flex-v-center pd-small radius-small hover:bg-white"
      :class="{ 'bg-white': route.name === 'Profile Edit Account' }"
    >
      <IconLock class="mn-r-thin i-medium"/>
      <span>Account</span>
    </RouterLink>
  </nav>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue';
  import IconLock from '@martyrs/src/modules/icons/entities/IconLock.vue';
  const route = useRoute()
  const userId = computed(() => route.params._id || auth.state.user._id)
</script>