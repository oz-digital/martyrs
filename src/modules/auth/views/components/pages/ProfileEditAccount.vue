<template>
  <div v-if="show" class="for-transition w-100">
    <ProfileEditCredentials class="bg-white mn-b-thin pd-medium"/>

    <div class="bg-white mn-b-thin pd-medium">
      <h3 class="mn-b-small">Settings</h3>
      <Checkbox 
        :label="'Darkmode'"
        :radio="globals.state.theme.darkmode"
        @update:radio="event => globals.actions.toggleTheme()"
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
  
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as users from '@martyrs/src/modules/auth/views/store/users.js'
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
  
  const route = useRoute()
  const router = useRouter()
  const show = ref(false)
  
  onMounted(async () => {
    const userId = route.params._id || auth.state.user._id
    await users.actions.read({ _id: userId, user: auth.state.user._id })
    show.value = true
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