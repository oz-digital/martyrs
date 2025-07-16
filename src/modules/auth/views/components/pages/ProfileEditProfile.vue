<template>
  <div class="for-transition w-100">
    <div class="bg-white mn-b-thin">
      <h4 class="mn-b-small">Profile</h4>

      <div class="mn-b-thin radius-small w-100 h-10r bg-light flex-center flex-column flex">
        <UploadImage 
          v-model:photo="users.state.current.profile.photo"
          :uploadPath="'users/' + users.state.current._id + '/avatars'"
          class="h-4r w-4r aspect-1x1 o-hidden bg-white mn-b-thin radius-extra" 
        />
        <h4>Upload userpic</h4>
      </div>

      <Field 
        v-model:field="users.state.current.username"     
        label="@"  
        placeholder="Not specified" 
        class="mn-b-thin w-100 bg-light pd-medium radius-small" 
        :validation="organizationName" 
      />

      <p class="mn-b-semi">Your username will be used for URL of profile like {{API_URL}}/users/username</p>

      <Field 
        v-model:field="users.state.current.profile.name"     
        label="Name"  
        placeholder="Not specified" 
        class="mn-b-thin bg-light pd-medium radius-small" 
        :validation="organizationName" 
      />

      <Field 
        v-model:field="users.state.current.profile.description"     
        label="Description"  
        placeholder="Not specified" 
        class="mn-b-semi bg-light pd-medium radius-small" 
        :validation="organizationName" 
      />
    </div>

    <div class="bg-white mn-b-thin">
      <h3 class="mn-b-small">Socials</h3>
      <p class="mn-b-thin">Please provide only the username for social media profiles, without full links.</p>

      <Field 
        v-model:field="users.state.current.socials.instagram"
        label="Instagram"   
        placeholder="" 
        class="mn-b-thin bg-light pd-medium radius-small" 
      />
      <Field 
        v-model:field="users.state.current.socials.twitter"
        label="Twitter"   
        placeholder="" 
        class="mn-b-thin bg-light pd-medium radius-small" 
      />
      <Field 
        v-model:field="users.state.current.socials.facebook"
        label="Facebook"   
        placeholder="" 
        class="mn-b-thin bg-light pd-medium radius-small" 
      />
      <Field 
        v-model:field="users.state.current.socials.telegram"
        label="Telegram"   
        placeholder="" 
        class="mn-b-semi bg-light pd-medium radius-small" 
      />
    </div>

    <Button 
      :submit="onSubmit" 
      :callback="redirectTo" 
      class="mn-b-thin bg-main w-100"
    > 
      Save
    </Button>
  </div>
</template>

<script setup>
  import Field from '@martyrs/src/components/Field/Field.vue'
  import Button from '@martyrs/src/components/Button/Button.vue'
  import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue'
  
  import { useRouter } from 'vue-router'
  
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as users from '@martyrs/src/modules/auth/views/store/users.js'
  
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
  
  function redirectTo() {
    router.back()
  }
</script>