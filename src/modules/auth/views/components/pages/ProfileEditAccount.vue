<template>
  <div class="for-transition w-100">
    <ProfileEditCredentials class="bg-white mn-b-thin"/>

    <div class="bg-white mn-b-thin ">
      <h3 class="mn-b-small">Settings</h3>
      <Checkbox 
        :label="'Darkmode'"
        :radio="core.state.theme.darkmode"
        @update:radio="event => core.actions.toggleTheme()"
        class="w-100 bg-light t-black pd-medium radius-small"
      />
    </div>

    <Button 
      :submit="onSubmit" 
      :callback="redirectTo" 
      class="mn-b-thin bg-main w-100"
    > 
      Save
    </Button>

    <Button
      :submit="onSubmitDelete" 
      :callback="() => router.push({name: 'Sign In'})" 
      class="mn-b-thin w-100 bg-red t-white"
    >
      Delete Account
    </Button>
  </div>
</template>

<script setup>
  import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
  import Button from '@martyrs/src/components/Button/Button.vue'
  import ProfileEditCredentials from '@martyrs/src/modules/auth/views/components/sections/ProfileEditCredentials.vue'
  
  import { useRouter } from 'vue-router'

  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as users from '@martyrs/src/modules/auth/views/store/users.js'
  import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'

  const store = useStore()
  const core = store.core
  const router = useRouter()
  
  defineProps({
    userData: {
      type: Object,
      required: true
    }
  })
  
  async function onSubmit() {
    await users.actions.update(users.state.current)
  }
  
  async function onSubmitDelete() {
    const confirmation = window.confirm("Are you sure you want to delete your account? Restoration will be possible only with the help of an administrator.")
    
    if (!confirmation) return
    
    users.state.current.status = 'removed'
    await users.actions.update(users.state.current)
    auth.actions.logout()
  }
  
  function redirectTo() {
    router.back()
  }
</script>