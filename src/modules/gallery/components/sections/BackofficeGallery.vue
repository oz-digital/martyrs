<template>
  <div class="cols-1 gap-thin pd-thin">
    <SectionPageTitle
      title="Gallery"
      @update:tabs_current="(update) => tab = update"
      :tabs_current="tab"
      :tabs="[
        { name: 'All', value: 'all' },
        { name: 'Featured', value: 'featured' },
        { name: 'Published', value: 'published' },
        { name: 'Draft', value: 'draft' },
        { name: 'Archived', value: 'archived' }
      ]"
      :actions="[
        ...(hasAccess(route.params._id, 'gallery', 'create', auth.state.accesses, auth.state.access.roles) ? [{ method: () => openPhotoPopup(null), label: 'Add Photo' }] : [])
      ]"
      class="mn-b-small bg-light bg-light radius-big"
    />

    <Feed
      v-model:items="photos"
      v-model:sort="sort"
      v-model:date="date"
      :states="{
        empty: {
          title: 'No Photos Found',
          description: 'Currently, there are no photos in gallery.'
        },
      }"
      :store="{
        read: (options) => gallery.read(options)
      }"
      :options="{
        limit: 15,
        owner: route.params._id,
        ...(tab !== 'all' && { status: tab })
      }"
      v-slot="{ 
        items 
      }"
      class="cols-3 mobile:cols-1 gap-thin"
    >
      <div v-for="item in items"  :key="item._id" class="bg-light radius-small flex-column pos-relative flex-wrap">

        <CardHeader 
          :entity="item"
          :entityType="'photo'"
          :user="auth.state.user._id"
          :owner="item.creator" 
          :creator="item.creator"
          :date="item.createdAt"
          :actions="[
            ...(hasAccess(route.params._id, 'gallery', 'delete', auth.state.accesses, auth.state.access.roles) ? [{ method: () => deletePhoto(item), label: 'Delete' }] : []),
            ...(hasAccess(route.params._id, 'gallery', 'edit', auth.state.accesses, auth.state.access.roles) ? [
                ...(item.status !== 'archived' ? [{ method: () => changeStatus(item, 'archived'), label: 'Archive' }] : []),
                ...(item.status !== 'published' ? [{ method: () => changeStatus(item, 'published'), label: 'Publish' }] : []),
                ...(item.status !== 'draft' ? [{ method: () => changeStatus(item, 'draft'), label: 'Draft' }] : [])
            ] : [])
          ]"
          class="pd-small mn-b-small"
        />

        <div class="pos-relative">
          <img loading="lazy" 
            :src="(FILE_SERVER_URL || '') + item.cover" 
            class="w-100 h-20r object-fit-contain bg-black " @click="openPreviewPopup(item)" 
          />
          <div 
            class="pos-absolute pos-t-0 pos-r-0 pd-micro t-white uppercase t-semi p-small flex-center flex pd-r-small pd-l-small mn-r-small mn-t-small w-min bg-second radius-extra"
          >
            {{item.status}}
          </div>
        </div>
        
        <div class="pd-small">
          <Chips 
            v-if="item.tags?.length > 0" 
            :chips="item.tags"
          />
        </div>
     </div>
    </Feed>

    <Popup 
      @close-popup="closePreviewPopup" 
      :isPopupOpen="isOpenPreviewPopup"
      class="bg-black o-hidden w-100 h-100 radius-big"
    >
      <PhotoViewer
        :photoUrl="selectedPhoto.image"
      />
    </Popup>

    <Popup 
      title="Add Photo" 
      @close-popup="closePhotoPopup" 
      :isPopupOpen="isOpenPhotoPopup"
      class="bg-white w-max-30r radius-big pd-big"
    >
      <img loading="lazy" 
        v-if="selectedImage.cover" 
        :src="selectedImage.cover" 
        class="radius-small w-100 mn-b-small h-20r object-fit-cover " 
      />

      <EditImages 
        :images="uploadedImages" 
        :uploadPath="'/photos'" 
        @update:images="onUpdatedImages" 
        class="mn-b-semi bg-light radius-medium"
      />

      <BlockTags
        @tags-changed="newTags => selectedImage.tags = newTags"
        :tags="selectedImage.tags"
        :tagsSuggested="[
          {text: 'people' },
          {text: 'events' },
          {text: 'place' },
          {text: 'food' },
          {text: 'drinks' },
          {text: 'special' },
        ]"
        class="mn-b-semi"
      />

      <div class="flex-nowrap flex gap-thin">
        <Button 
          :submit="() => createPhoto('draft')" 
          :callback="closePhotoPopup" 
          class="t-nowrap bg-second w-100"
        >
          To drafts
        </Button>
         <Button 
          :submit="() => createPhoto('published')" 
          :callback="closePhotoPopup" 
          class="bg-main w-100"
        >
          Publish
        </Button>
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

import Field from '@martyrs/src/components/Field/Field.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import Chips  from '@martyrs/src/components/Chips/Chips.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import SelectMulti from '@martyrs/src/components/SelectMulti/SelectMulti.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import PhotoViewer from '@martyrs/src/components/PhotoViewer/PhotoViewer.vue'

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  
import gallery from '@martyrs/src/modules/gallery/store/gallery.js';

import CardHeader  from '@martyrs/src/modules/core/views/components/blocks/CardHeader.vue'
import SectionPageTitle from '@martyrs/src/modules/core/views/components/sections/SectionPageTitle.vue'

import EditImages from '@martyrs/src/components/EditImages/EditImages.vue';
import BlockTags from '@martyrs/src/components/FieldTags/BlockTags.vue';

const route = useRoute();

// Tabs
const tab = ref('all')
// Sort
let sort = ref({
  param: 'createdAt',
  order: 'desc',
  options: [{
    label: 'Date',
    value: 'createdAt'
  },{
    label: 'Popularity',
    value: 'views'
  },{
    label: 'Creator',
    value: 'creator'
  }]
})
// Date
let date = ref({
  start: null,
  end: null
})
// Popup
// Preview Photo
const isOpenPreviewPopup = ref(false);
function openPreviewPopup(photo) {
  isOpenPreviewPopup.value = true;
  selectedPhoto.value = photo;
}
function closePreviewPopup() {
  isOpenPreviewPopup.value = false;
  selectedPhoto.value = null;
}
// Add Photo
const isOpenPhotoPopup = ref(false);
function openPhotoPopup(photo) {
  isOpenPhotoPopup.value = true;
  selectedPhoto.value = photo;
}
function closePhotoPopup() {
  isOpenPhotoPopup.value = false;
  selectedPhoto.value = null;
  uploadedImages.value = [];
  selectedImage.value = { tags: null, image: null };
}
// Selected Photo
const selectedPhoto = ref(null);
const selectedCategory = ref('all')
const selectedImage = ref({
  tags: null,
  image: null
})
const uploadedImages = ref([])
const onUpdatedImages = (newImages) => {
  uploadedImages.value = newImages
}
// Gallery Grid
const photos = ref([])

const deletePhoto = async (item) => {
  let deletedPhoto = JSON.parse(JSON.stringify(item));

  deletedPhoto.owner.target = deletedPhoto.owner.target._id
  deletedPhoto.creator.target = deletedPhoto.creator.target._id

  await gallery.delete(deletedPhoto);

  gallery.removeItem(deletedPhoto, photos.value)
};

const changeStatus = async (item, status) => {
  let updatedPhoto = JSON.parse(JSON.stringify(item));

  updatedPhoto.status = status

  updatedPhoto.owner.target = updatedPhoto.owner.target._id
  updatedPhoto.creator.target = updatedPhoto.creator.target._id

  updatedPhoto = await gallery.update(updatedPhoto)
  gallery.updateItem(updatedPhoto, photos.value)
}

const createPhoto = async (status) => {
  if (uploadedImages.length < 1) {
    alert('Upload at least 1 image')
    return
  }

  let createdPhotos = await gallery.create({
    images: uploadedImages.value,
    tags: selectedImage.value.tags,
    status: status,
    owner: {
      type: 'Organization',
      target: route.params._id
    },
    creator: {
      type: 'User',
      target: auth.state.user._id
    }
  })

  for (let createdPhoto of createdPhotos) {
    gallery.addItem(createdPhoto, photos.value)
  }
}
</script>

<style scoped>
</style>