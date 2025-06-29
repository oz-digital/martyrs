<template>
  <article v-if="event" class="h-min-100 pd-thin">
    <div class="pd-medium radius-semi mn-b-thin bg-light">
      <h4 class="mn-b-small">Basic Info</h4>
    	<div class="mn-b-thin radius-small w-100 h-10r bg-white flex-center flex-column flex">
       	<UploadImage 
          v-model:photo="event.cover"
          :uploadPath="'specials'"
          class="h-4r w-4r aspect-1x1 o-hidden mn-b-thin radius-extra" 
        />
        <h4>Upload Event Cover</h4>
      </div>

    	<Field 
        v-model:field="event.name" 
        label="Name"
        placeholder="Event name" 
        class="mn-b-thin w-100 bg-white pd-medium radius-small" 
      />
      <Field 
        v-model:field="event.description" 
        type="textarea"  
        placeholder="Enter short description" 
        class="mn-b-thin w-100 bg-white pd-medium radius-small" 
      />
      <Field 
        v-model:field="event.location" 
        label="Location"
        placeholder="Event location" 
        class="mn-b-thin w-100 bg-white pd-medium radius-small" 
      />
      <VueDatePicker v-model="date"  range class="z-index-3 radius-small mn-b-semi bg-white" />
    </div>

   <!--    <Calendar
        v-model:date="date"
        :locale="$i18n.locale"
        :allowRange="false"
        class="radius-semi w-100 o-hidden bg-light"
      /> -->

    <Block
      title="Tickets"
      placeholder="No line ups added yet"
      :actions="[{
        label: '+',
        function: () => event.ticketsTypes.push({name: null, description: null, photo: null, main: false})
      }]"
      class="cols-1 mn-b-thin t-black gap-thin"
    >
      <div 
        class="mn-b-thin gap-small flex-nowrap flex" 
        v-for="(item, index) in event.ticketsTypes" 
        :key="index"
      > 
        <Field
          v-model:field="item.name"
          placeholder="Name"
          class="w-100  bg-white radius-small pd-medium"
        />  
        <Field
          v-model:field="item.price"
          placeholder="Price"
          class="w-100  bg-white radius-small pd-medium"
        />
        <div @click="() => event.ticketsTypes.splice(index, 1)" class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-red">
          <IconDelete 
            class="i-medium"
          />
        </div>
      </div>
    </Block>

		<section v-if="event" class="pd-b-extra w-100 bg-light pd-big radius-medium">
      <Constructor 
        :content="event.content"
        @update="update => event.content = update"
      />
    </section>

    <section v-if="event" class="pd-thin pos-sticky pos-l-0 pos-b-0 w-100 ">
      <div class="pd-thin radius-big  bg-main w-100 flex-nowrap flex">
        <a v-if="route.params.url" @click="onDelete()" class="mn-r-auto bg-red t-white t-black button"><span>Delete</span></a>
        <a @click="onDrafts()" class="mn-l-auto bg-white t-black button"><span>To Drafts</span></a>
        <a @click="openPublicationPopup()" class="mn-l-thin bg-black t-white button"><span>Publish</span></a>
      </div>
    </section>

    <Popup 
      title="Final Touches" 
      @close-popup="closePublicationPopup" 
      :isPopupOpen="isPublicationPopup"
      class="w-m-33r t-left pd-big bg-white radius-big"
    > 
      <BlockTags
        @tags-changed="newTags => event.tags = newTags"
        :tags="event.tags"
        class="mn-b-small"
      />

      <h5 class="mn-b-small">Add to public</h5>
      <Card
        v-if="selectedOrganization"
        :photo="selectedOrganization.profile?.photo"
        :title="selectedOrganization.profile?.name"
        @click="() => { 
          selectedOrganization = null
        }"
        class="h-4r w-100 bg-light pd-thin radius-medium  mn-b-thin"
      />

      <section v-else class="mn-b-thin h-25r o-x-hidden o-y-scroll bg-light radius-big pd-small ">
        <Feed
          :showLoadMore="false" 
          :search="{
            placeholder: 'Search organization...',
            class: 'bg-white mn-b-thin'
          }"
          :states="{
            empty: {
              title: 'No organizations Found',
              description: 'Currently, there are no such organizations available.'
            }
          }"
          :store="{
            read: (options) => organizations.actions.read(options),
            state: null
          }"
          :options="{
            user: auth.state.user._id,
            postable: auth.state.user._id,
            lookup: ['memberships']
          }"
          v-slot="{ 
            items 
          }"
        >
          <Card
            v-for="(organization, index) in items" 
            v-memo="[organization._id, organization.profile.name]"
            :photo="organization.profile?.photo"
            :title="organization.profile?.name"
            @click="() => { 
              selectedOrganization = organization
            }"
            class="h-4r bg-white pd-thin radius-medium w-100 mn-b-thin"
          />
        </Feed>
      </section>

      
      <h5 v-if="selectedOrganization" class="mn-b-thin">Options:</h5>
      <div v-if="selectedOrganization" class="mn-b-medium br-grey-transp-25 br-2px br-solid pd-small radius-big">
        <Checkbox 
          :label="'Hide Author'"
          :radio="event.creator.hidden"
          @update:radio="updateEvent => event.creator.hidden = updateEvent"
          name="prices"
          class="w-100"
        />
      </div>
      <Button :submit="onSubmit" :callback="redirectTo" class="w-100 bg-black t-white">Publish</Button>
    </Popup>
  </article>

</template>

<script setup>
import Textarea from '@martyrs/src/modules/constructor/components/elements/Textarea.vue';
import Constructor from '@martyrs/src/modules/constructor/components/sections/Constructor.vue';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'



import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'

import Block from '@martyrs/src/components/Block/Block.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Field from '@martyrs/src/components/Field/Field.vue'
import BlockTags from '@martyrs/src/components/FieldTags/BlockTags.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import SelectMulti from '@martyrs/src/components/SelectMulti/SelectMulti.vue';
import Upload  from '@martyrs/src/components/Upload/Upload.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import EditImages from '@martyrs/src/components/EditImages/EditImages.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import Button from '@martyrs/src/components/Button/Button.vue';   

import Card from '@martyrs/src/modules/globals/views/components/blocks/Card.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

import * as events from '@martyrs/src/modules/events/store/events.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';

const route = useRoute();
const router = useRouter();

const { hasAccess } = useGlobalMixins()

let event = ref(null);
let publics = ref(null);

const selectedTags = ref([]);
const selectedOrganization = ref(null);

const date = ref(new Date);
const customPosition = () => ({ top: 0, left: 0 });

onMounted(async () =>{
  
  if (route.params.url) {
    const data = await events.read({ user: auth.state.user._id, url: route.params.url });

    event.value = data.pop();

    if (!event.value) {
     router.push({name: 'notfound'})
    }

    if (event.value.owner.type === 'organization') {
      // Если пост принадлежит организации, проверяем права на редактирование через `hasAccess`
      const isAccess = hasAccess(event.value.owner.target._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles);

      if (!isAccess) {
        router.push({name: 'unauthorized'})
      }
    }

     if (event.value.owner.type === 'user' && event.value.creator.target._id !== auth.state.user._id) {
      console.log(event.value.creator.target)
      console.log(auth.state.user._id)
      router.push({name: 'unauthorized'})
    }

    const startDate = event.value.date.start;
    const endDate = event.value.date.end;

    date.value = [startDate, endDate];

  } else {
    events.clean();
    event.value = events.state.current;

    const startDate = new Date();
    const endDate = new Date();
    date.value = [startDate, endDate];
  }

  if (!event.value.owner) event.value.owner = {
    target: auth.state.user._id,
    type: 'user'
  }

  if (!event.value.creator) event.value.creator = {
    target: auth.state.user._id,
    type: 'user',
    hidden: false
  }

  if (event.value.owner.type === 'organization') selectedOrganization.value = {
    _id: event.value.owner.target._id,
    profile: {
      name: event.value.owner.target.profile.name,
      photo: event.value.owner.target.profile.photo
    }
  }
})

const isPublicationPopup = ref(false)

function openPublicationPopup() {
  isPublicationPopup.value = true;
}
function closePublicationPopup() {
  isPublicationPopup.value = false;
}

function onDrafts() {

  if (selectedTags.value.length > 0) selectedTags.value.map(tag => (tag.text))

  event.value.status = "draft"
  
  event.value.date = {
    start: date.value[0],
    end: date.value[1]
  }

  if (route.params.url) {
    events.update(event.value)
      .then(response => {
        router.push({ name: 'Event', params: { url: response.url } });
      })
      .catch(error => {
        console.error(error);
      })
  } else {
    events.create(event.value)
      .then(response => {
        router.push({ name: 'Event', params: { url: response.url } });
      })
      .catch(error => {
        console.error(error);
      })
  }
}

function onSubmit() {

  if (selectedOrganization.value) event.value.owner = {
    target: selectedOrganization.value._id,
    type: 'organization'
  }

  if (!selectedOrganization.value) event.value.creator.hidden = false
  if (!selectedOrganization.value) event.value.organization = event.value.creator

  event.value.status = "published"

  event.value.date = {
    start: date.value[0],
    end: date.value[1]
  }

  console.log(date.value)
  if (route.params.url) {
    console.log(event.value)
    events.update(event.value)
      .then(response => {
        router.push({ name: 'Event', params: { url: response.url } });
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    events.create(event.value)
      .then(response => {
        router.push({ name: 'Event', params: { url: response.url } });
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function onDelete() {
  if (confirm('Are you sure you want to delete this event?')) {
    events.remove(event.value._id)
      .then(response => {
        router.push({ name: 'User Events', params: { user: event.value.creator.target._id } });
      })
      .catch(error => {
        console.error(error);
      })
  }
}
</script>

<style lang="scss">
  .dp__input {
    border: 0;
    padding: var(--medium);
    padding-left: 3rem;
    background: rgb(var(--white)) !important;
    border-radius: var(--small);
  }
</style>