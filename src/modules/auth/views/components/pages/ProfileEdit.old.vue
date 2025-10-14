<template>
	<div  v-if="show" class="for-transition w-100">
   
    <!-- <ProfileCompletion 
      v-if="route.params._id === auth.state.user._id" 
      :user="auth.state.user._id"
      :target="users.state.current"
      :cta="false"
    /> -->

    <div class="bg-white mn-b-thin pd-medium">
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

    <!-- <p class="mn-b-thin">Select your birthday if you want to receive your birthday gift.</p>
    
    <Field 
      v-model:field="users.state.current.birthday"     
      label="Birthday"  
      type="date"
      placeholder="Not specified" 
      class="mn-b-semi bg-light pd-medium radius-small" 
      :validation="organizationName" 
    /> -->
    <div class="bg-white mn-b-thin pd-medium">
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

    <ProfileEditCredentials class="bg-white mn-b-thin pd-medium"/>

    <div class="bg-white mn-b-thin pd-medium">
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
      :callback="a = () => {router.push({name: 'Sign In'})}" 
      class="mn-b-thin w-100 bg-red t-white"
    >
      Delete Account
    </Button>
	</div>
</template>

<script setup>
  // Import components
  import Tab           from '@martyrs/src/components/Tab/Tab.vue'
  import Field         from '@martyrs/src/components/Field/Field.vue'
  import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
  import Button        from '@martyrs/src/components/Button/Button.vue'
  import UploadImage   from '@martyrs/src/components/UploadImage/UploadImage.vue';

  import ProfileCompletion from '@martyrs/src/modules/auth/views/components/sections/ProfileCompletion.vue'
  import ProfileEditCredentials from '@martyrs/src/modules/auth/views/components/sections/ProfileEditCredentials.vue'
  // Import libs
  import { computed, onMounted, ref, onBeforeMount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  // Import state
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as users from '@martyrs/src/modules/auth/views/store/users.js'
  import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
  // Import validation
  import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
  const store = useStore()
  const core = store.core
  const passswordValidation = ref(null)
  // Accessing router
  const route = useRoute()
  const router = useRouter()

  const user = ref(null)
  const show = ref(false)


  onMounted(async () => {
    await users.actions.read({ _id: route.params._id, user: auth.state.user._id });
    show.value = true
  })
  // Methods

  async function onSubmit() {
    await users.actions.update(users.state.current)
  }

  // Добавляем редирект после сохранения
async function handleSave() {
  await onSubmit()
  router.replace({ name: 'User Profile', params: { _id: users.state.current._id }})
}

  async function onSubmitDelete() {
    const confirmation = window.confirm("Are you sure you want to delete your account? Restoration will be possible only with the help of an administrator.");
    
    if (!confirmation) {
        return;
    }

    users.state.current.status = 'removed'
    await users.actions.update(users.state.current)
    auth.actions.logout()
  }
  function redirectTo () {
    router.replace({ name: 'User Profile', params: { _id: users.state.current._id }});
  }

  defineExpose({
    onSubmit,
    redirectTo
  })
</script>

<style lang="scss">
	#header {
		// height: 3rem;
	}
</style>
