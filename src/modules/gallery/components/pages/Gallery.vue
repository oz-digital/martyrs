<template>
	<div class="cols-1 bg-white gap-thin pd-thin">
		<SectionPageTitle
      :title="$t('gallery.title')"
      @update:tabs_current="(update) => tab = update"
      :tabs_current="tab"
      :tabs="[
        { name: 'All', value: 'all' },
        { name: 'Place', value: 'place' },
        { name: 'Drinks', value: 'drinks' },
        { name: 'People', value: 'people' },
        { name: 'Events', value: 'events' }
      ]"
      class="mn-b-small bg-light bg-light radius-big"
    />
    <Popup 
      @close-popup="closePreviewPopup" 
      :isPopupOpen="isOpenPreviewPopup"
      class="bg-black o-hidden w-100 h-100 radius-big"
    >
      <PhotoViewer
        :photoUrl="((FILE_SERVER_URL || '') + selectedPhoto.image)"
      />
    </Popup>

		<Feed
      v-model:items="photos"
      v-model:sort="sort"
      v-model:date="date"
      :showLoadMore="false"
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
        status: 'published',
        ...(tab !== 'all' && { tags: tab })
      }"
      v-slot="{ 
        items 
      }"
      class="cols-4 gap-thin"
    >
      <div v-for="item in items"  :key="item._id" class="bg-light radius-medium o-hidden flex-column pos-relative flex-wrap">
        <div class="w-100 h-100 h-min-10r h-max-20r pos-relative">
          <img loading="lazy" 
            :src="((FILE_SERVER_URL || '') + item.cover)" 
            class="w-100 h-100 object-fit-cover bg-black " @click="openPreviewPopup(item)" 
          />
        </div>
     	</div>
    </Feed>
	</div>
</template>

<script setup>
	import { ref, onMounted, reactive, computed } from 'vue'

	import Title from '@martyrs/src/modules/globals/views/components/sections/Title.vue';

	import Feed from '@martyrs/src/components/Feed/Feed.vue'
	import Popup from '@martyrs/src/components/Popup/Popup.vue'
	import PhotoViewer from '@martyrs/src/components/PhotoViewer/PhotoViewer.vue'

	import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue'

	import gallery from '@martyrs/src/modules/gallery/store/gallery.js';

	const photos = ref([])

	const tab = ref('all')

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

	const selectedPhoto = ref(null);

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

</script>