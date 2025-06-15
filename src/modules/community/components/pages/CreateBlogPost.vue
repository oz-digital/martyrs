<template>
  <article 
    class="w-100 bg-light radius-medium pos-relative"
  >
    <section  
      style="min-height: 100%;"
      class="w-100 pd-big"
    >
      <!-- Title -->
      <div 
        class="w-full h-full"
      >
        <!-- <Textarea 
          v-if="post" 
          :prop="post" 
          :setFocus="true"
          content="name" 
          placeholder="Enter post title" 
          class="h2"
        /> -->
      </div>

      <Constructor 
        v-if="post" 
        :content="post.content"
        @update="update => post.content = update"
      />

    </section>

    <transition  name="scaleIn" >
      <section v-if="post" class="pd-small pos-sticky pos-l-0 pos-b-0 w-100 ">
        <div class="pd-thin radius-big  bg-main w-100 flex-nowrap flex">
          <button v-if="route.params.url" @click="onDelete()" class="mn-r-auto bg-red t-white t-black button"><span>Delete</span></button>
          <button @click="onDrafts()" class="mn-l-auto bg-white t-black button"><span>To Drafts</span></button>
          <button @click="openPulicationPopup()" class="mn-l-thin bg-black t-white button"><span>Publish</span></button>
        </div>
      </section>
    </transition>

    <Popup  
      @close-popup="closePublicationPopup" 
      :isPopupOpen="isPublicationPopup"
      class="w-m-33r t-left pd-big bg-white radius-big"
    >
      <h3 class="mn-b-small">Final Touches</h3>
      
      <BlockTags
        @tags-changed="newTags => post.tags = newTags"
        :tags="post.tags"
        class="mn-b-small"
      />

      <h5 class="mn-b-small">Add source:</h5>
      <Field 
        v-model:field="post.source"    
        placeholder="Add full link to the source" 
        class="mn-b-medium bg-light radius-medium pd-small" 
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
          :radio="post.creator.hidden"
          @update:radio="event => post.creator.hidden = event"
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

import Popup from '@martyrs/src/components/Popup/Popup.vue'
import FieldTags from '@martyrs/src/components/FieldTags/FieldTags.vue'
import BlockTags from '@martyrs/src/components/FieldTags/BlockTags.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Button from '@martyrs/src/components/Button/Button.vue';   
import Feed from '@martyrs/src/components/Feed/Feed.vue'

import Card from '@martyrs/src/modules/globals/views/components/blocks/Card.vue';

import { ref, onMounted, watchEffect, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';
// Store & Router
import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
import * as auth  from '@martyrs/src/modules/auth/views/store/auth.js'
import * as organizations  from '@martyrs/src/modules/organizations/store/organizations.js'
    
import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

const { hasAccess } = useGlobalMixins()

const route = useRoute();
const router = useRouter();

let post = ref(null);
let publics = ref(null);

const selectedTags = ref([]);
const selectedOrganization = ref(null);

onMounted(async () =>{
  
  if (route.params.url) {
    const data = await blog.read({ user: auth.state.user._id, url: route.params.url });
    
    post.value = data.pop();

    if (!post.value) {
      router.push({name: 'notfound'})
    }

    if (post.value.owner.type === 'organization') {
      // Если пост принадлежит организации, проверяем права на редактирование через `hasAccess`
      const isAccess = hasAccess(post.value.owner.target._id, 'posts', 'edit', auth.state.accesses, auth.state.access.roles);

      if (!isAccess) {
        router.push({name: 'unauthorized'})
      }
    }

     if (post.value.owner.type === 'user' && post.value.creator.target._id !== auth.state.user._id) {
      router.push({name: 'unauthorized'})
    }
  } else {
    blog.clean();
    post.value = blog.state.current;
  }

  if (!post.value.owner) post.value.owner = {
    target: auth.state.user._id,
    type: 'user'
  }

  if (!post.value.creator) post.value.creator = {
    target: auth.state.user._id,
    type: 'user',
    hidden: false
  }


  if (post.value.owner.type === 'organization') selectedOrganization.value = {
    _id: post.value.owner.target._id,
    name: post.value.owner.target.profile.name,
    photo: post.value.owner.target.profile.photo
  }
})
// /////////////////////////////////////////
// Publication Form
// /////////////////////////////////////////
const tag = ref('');
const autocompleteItems = ref([
  { text: 'story' },
  { text: 'news' },
  { text: 'guide' },
  { text: 'discussion' },
  { text: 'photos' },
]);

const filteredItems = computed(() => {
  return autocompleteItems.value.filter(i => {
    return i.text.toLowerCase().includes(tag.value.toLowerCase());
  });
});

const filteredSuggestedItems = computed(() => {
    return autocompleteItems.value.filter(item => {
      return !selectedTags.value.some(tag => tag.text === item.text);
    });
  })

function addTag (tag) {
  selectedTags.value.push(tag)
}
// /////////////////////////////////////////
// Publication Popup
// /////////////////////////////////////////
const isPublicationPopup = ref(false)

function openPulicationPopup() {
  isPublicationPopup.value = true;
}
function closePublicationPopup() {
  isPublicationPopup.value = false;
}

function onDrafts() {

  if (selectedTags.value.length > 0) selectedTags.value.map(tag => (tag.text))

  post.value.status = "draft"
  post.value.name = post.value.content[0].content

  if (route.params.url) {
    blog.update(post.value)
      .then(response => {
        router.push({ name: 'BlogPost', params: { url: response.url } });
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    blog.create(post.value)
      .then(response => {
        router.push({ name: 'BlogPost', params: { url: response.url } });
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function onSubmit() {

  if (selectedOrganization.value) post.value.owner = {
    target: selectedOrganization.value._id,
    type: 'organization'
  }

  if (!selectedOrganization.value) post.value.creator.hidden = false
  if (!selectedOrganization.value) post.value.organization = post.value.creator

  post.value.status = "published"
  post.value.name = post.value.content[0].content

  if (route.params.url) {
    blog.update(post.value)
      .then(response => {
        console.log(post.value)
        router.push({ name: 'BlogPost', params: { url: response.url } });
      })
      .catch(error => {
        console.error(error);
      });
  } else {
    blog.create(post.value)
      .then(response => {
        router.push({ name: 'BlogPost', params: { url: response.url } });
      })
      .catch(error => {
        console.error(error);
      });
  }
}

function onDelete() {
  if (confirm('Are you sure you want to delete this post?')) {
    blog.remove(post.value._id)
      .then(response => {
        router.push({ name: 'User Posts', params: { _id: post.value.creator.target._id } });
      })
      .catch(error => {
        console.log(error);
      });
  }
}
</script>


<style lang="scss">

</style>
