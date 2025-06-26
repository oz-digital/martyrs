<template>
  <Popup 
    :isPopupOpen="true" 
    @close-popup="router.back()"
    title="Edit Profile"
    align="center center"
    class="w-100 max-w-40r bg-white radius-medium pd-medium"
  >
    <div class="flex gap-medium">
      <ProfileEditSidebar class="w-12r flex-shrink-0" />
      
      <div class="flex-grow">
        <RouterView />
      </div>
    </div>
  </Popup>
</template>

<script setup>
  import Popup from '@martyrs/src/components/Popup/Popup.vue'
  import ProfileEditSidebar from './ProfileEditSidebar.vue'
  
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
</script>