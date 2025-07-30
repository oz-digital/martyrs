<template>
<div class="for-transition pd-thin">
  
  <h3 class="mn-b-small">Type of group</h3>
  <p class="mn-b-thin">Public groups are open to everyone, whereas in exclusive groups only members can post. If you wish to make a group private, select 'hidden'.</p>
  
  <SelectMulti
    v-model="organization.state.current.types"
    :options="['public','exclusive','hidden']"
    :multiple="false"
    :taggable="false"
    placeholder="Type to search or add type of organization"
    class="mn-b-semi bg-light pd-medium radius-small" 
  />


  <h3 class="mn-b-small">Profile</h3>

  <div class="mn-b-thin radius-small w-100 h-10r bg-light flex-center flex-column flex">
    <UploadImage 
      v-model:photo="organization.state.current.profile.photo"
      :uploadPath="'organizations/' + organization.state.current._id + '/avatars'"
      class="h-4r w-4r aspect-1x1 o-hidden mn-b-thin radius-extra" 
    />
    <h4>Upload photo</h4>
  </div>

    <Field 
      v-model:field="organization.state.current.profile.name"   
      placeholder="Name of organization" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />

    <Field 
      v-model:field="organization.state.current.profile.description"    
      placeholder="Brief description of your group" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <BlockTags
      @tags-changed="newTags => organization.state.current.profile.tags = newTags"
      :tags="organization.state.current.profile.tags"
      class="mn-b-small"
    />

    <h3 class="mn-b-small">Contacts</h3>
    <Field 
      v-model:field="organization.state.current.contacts.email"
      label="Email"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.contacts.website"
      label="Website"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.contacts.phone"
      label="Phone"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.contacts.address"
      label="Address"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />

    <h3 class="mn-b-small">Socials</h3>
    <p class="mn-b-thin">Please provide only the username for social media profiles, without full links.</p>

    <Field 
      v-model:field="organization.state.current.socials.instagram"
      label="Instagram"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.socials.twitter"
      label="Twitter"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.socials.facebook"
      label="Facebook"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.socials.telegram"
      label="Telegram"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
    <Field 
      v-model:field="organization.state.current.socials.youtube"
      label="Youtube"   
      placeholder="" 
      class="mn-b-thin bg-light pd-medium radius-small" 
    />
   
   
    <Button :submit="onSubmit" :callback="redirectTo" class="bg-main w-100 mn-b-thin">Save</Button>
    <!-- <Button :submit="onDelete" :callback="redirectDash" class="mn-b-thin bg-fourth">Delete</Button> -->

</div>

</template>

<script setup>
  import { onMounted, computed } from 'vue';

  import { useRoute, useRouter } from 'vue-router';

  import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
  import BlockTags    from '@martyrs/src/components/FieldTags/BlockTags.vue'
  import Tab from '@martyrs/src/components/Tab/Tab.vue';
  import Field from '@martyrs/src/components/Field/Field.vue';
  import Select from '@martyrs/src/components/Select/Select.vue';
  import SelectMulti    from '@martyrs/src/components/SelectMulti/SelectMulti.vue'
  import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
  import Button from '@martyrs/src/components/Button/Button.vue';
  import Popup from '@martyrs/src/components/Popup/Popup.vue';

  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';
  import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js';

  const route = useRoute()
  const router = useRouter()

  organization.actions.reset();

  onMounted(async()=>{
    if (route.params._id) {
      await organization.actions.read({ _id: route.params._id });
    } 
  })
  
  const organizationData = computed(() => organization.state.current)

  async function onSubmit() {
    if (route.params._id) {
      await organization.actions.update(route.params._id, organizationData.value)
    } else {
      await organization.actions.create(organization.state.current, auth.state.user._id)
    }
  }

  async function onDelete() {
    if (route.params._id) {
      await organization.actions.remove(route.params._id)
      router.push({name: 'Organization'})
    }
  }

  function redirectTo () {
    router.replace({ name: 'Organization', params: { _id: organization.state.current._id }});
  }
</script>