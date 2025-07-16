<template>
  <Popup 
    :isPopupOpen="true" 
    @close-popup="router.push({ 
      name: 'User Profile', 
      params: { 
        _id: auth.state.user._id 
      },
      query: { 
        afterAuth: 'true' 
      }
    })"
    title="Edit Profile"
    align="center center"
    class="w-m-50r h-40r mobile:h-100 h-m-40r bg-white mobile:radius-zero radius-medium pd-medium"
  >
    <div v-if="loading" class="flex-center h-100">
      <Loader />
    </div>
    
    <div v-else class="flex h-min-100 flex-row mobile:flex-column gap-medium">
      <ProfileEditSidebar class="w-10r mobile:w-100 flex-shrink-0" />
      
      <RouterView :userData="userData" />
    </div>
  </Popup>
</template>

<script setup>
  import Popup from '@martyrs/src/components/Popup/Popup.vue'
  import Loader from '@martyrs/src/components/Loader/Loader.vue'
  import ProfileEditSidebar from './ProfileEditSidebar.vue'
  
  import { ref, onMounted, provide } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as users from '@martyrs/src/modules/auth/views/store/users.js'
  
  const loading = ref(true)
  const userData = ref(null)
  
  onMounted(async () => {
    try {
      const userId = route.params._id || auth.state.user._id
      await users.actions.read({ _id: userId, user: auth.state.user._id })
      userData.value = users.state.current
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      loading.value = false
    }
  })
  
  // Provide user data to nested routes
  provide('userData', userData)
</script>