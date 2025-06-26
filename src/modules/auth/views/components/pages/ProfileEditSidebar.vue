<template>
  <nav class="bg-light pd-medium radius-small">
    <RouterLink 
      :to="{ name: 'Profile Edit Profile', params: { _id: userId } }"
      class="flex items-center pd-small mn-b-thin radius-small hover:bg-white"
      :class="{ 'bg-white': route.name === 'Profile Edit Profile' }"
    >
      <span>Profile</span>
    </RouterLink>
    
    <RouterLink 
      :to="{ name: 'Profile Edit Account', params: { _id: userId } }"
      class="flex items-center pd-small radius-small hover:bg-white"
      :class="{ 'bg-white': route.name === 'Profile Edit Account' }"
    >
      <span>Account</span>
    </RouterLink>
  </nav>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  
  const route = useRoute()
  const userId = computed(() => route.params._id || auth.state.user._id)
</script>