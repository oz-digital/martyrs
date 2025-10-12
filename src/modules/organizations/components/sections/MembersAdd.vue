<template>
  <div>
    <p class="mn-b-thin t-transp p-regular">{{text}}</p> 

    <div class="mn-b-thin pos-relative">
      <BlockSearch 
        v-click-outside="() => {searchUserShow = false}" 
        @search="(event) => { searchUser = event; searchUserShow = true }"
        placeholder="Enter name, phone or email"
        class="bg-grey"
      />

      <div 
        v-if="searchUser && searchUserShow" 
        class="mn-t-thin pos-absolute w-100 pos-t-100 pos-l-0 z-index-3 bg-light pd-small radius-small
      ">
        <Feed
          :states="{
            empty: {
              title: 'No User Found',
              description: 'Currently, there are no such user.'
            }
          }"
          :store="{
            read: (options) => users.actions.read(options),
            state: null
          }"
          :options="{
            search: searchUser
          }"
          :showLoadMore="false"
          v-slot="{ 
            items 
          }"
          class="h-max-20r o-scroll"
        >
          <CardUser
            v-for="(user, index) in items" :key="user._id"
            :user="user"
            :photo="user.profile.photo"
            :name="user.profile.name || user.phone || user.email"
            @click="() => { 
              members.push({contact: user.email || user.phone})
              searchUserShow = false
            }"
            class="bg-white h-2r pd-thin radius-medium w-100 mn-b-thin"
          />
        </Feed>
      </div>
    </div>

    <section class="cols-1 mn-b-small radius-medium pd-semi bg-light pos-relative">

      <div
        v-for="(member, index) in members" 
        :key="index" 
        class="
          br-1px br-solid br-grey-transp-25
          flex
          gap-thin
          radius-small
          mn-b-thin
        "
      >
        <Field 
          v-model:field="member.contact"   
          placeholder="Enter email or phone" 
          class="w-100 pd-small radius-small bg-white"
          :validation="contactValidation"
        >
          <div 
            v-if="index < 1" 
            @click="() => members.push({contact: ''})"  
            class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-green"
          >
            <IconAdd 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>

          <div 
            v-else 
            @click="() => members.splice(index, 1)" 
            class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-red"
          >
            <IconDelete 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>
        </Field>
      </div>
    </section>


      <Button  
        :submit="submitMembers" 
        class="w-100 bg-main">
        <span>Invite to organization</span>
      </Button>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  import Field    from '@martyrs/src/components/Field/Field.vue'
  import Select   from '@martyrs/src/components/Select/Select.vue'
  import Button   from '@martyrs/src/components/Button/Button.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import BlockSearch from '@martyrs/src/modules/core/views/components/blocks/BlockSearch.vue'

  import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

  import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
  import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';
  // Import validation
  import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
  // Store
  import * as users from '@martyrs/src/modules/auth/views/store/users.js';
  // Props
  const props = defineProps({
    organization: Object,
    text: String,
  });
  // User Search
  let searchUser = ref(null)
  let searchUserShow = ref(false)
  // Validation
  const contactValidation = ref(null)
  // Define Emits
  const emits = defineEmits(['send-invite']);
  // Define State
  const members = ref([{ contact: ''}]);

  async function submitMembers() {
    return new Promise((resolve, reject) => {
      emits('send-invite', members.value, resolve, reject);
    });
  }
</script>