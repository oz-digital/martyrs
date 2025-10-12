<template>
  <Block
    v-if="pagesAll"
    class="mn-b-thin pd-small radius-semi cols-1 gap-thin"
  >
  
    <CardPage 
      v-for="page in pagesAll" 
      :page="page" 
      class="radius-small pd-thin"
      :hasAdminRights="hasAdminRights"
      @createPage="openPulicationPopup"
    />

    <Popup  
      @close-popup="closePublicationPopup" 
      :isPopupOpen="isPublicationPopup"
      class="w-m-33r t-left pd-big bg-white radius-big"
    >
      <div class="h-max-20r o-scroll">
        <Constructor 
          :content="newPage.content"
          @update="update => newPage.content = update"
        />
      </div>
      <Button 
        :submit="() => onSubmit()" 
        class="mn-l-auto t-nowrap t-white bg-black w-max"
      >
        Save
      </Button>
    </Popup>
  </Block>
</template>

<script setup>
  import { onMounted, ref, toRefs, computed } from 'vue'
  
  import { useRoute,useRouter } from 'vue-router'

  import Block from '@martyrs/src/components/Block/Block.vue';
  import Popup from '@martyrs/src/components/Popup/Popup.vue'
  import Button from '@martyrs/src/components/Button/Button.vue'

  import Constructor from '@martyrs/src/modules/constructor/components/sections/Constructor.vue';

  import CardPage from '../blocks/CardPage.vue'

  import * as pages from '../../store/pages.js'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

  import { useGlobalMixins } from "@martyrs/src/modules/core/views/mixins/mixins.js"

  const { 
    normalizeUrlParam, 
    joinArrayToUrl,
    isAdmin
  } = useGlobalMixins()

  const hasAdminRights = computed(() => {
    return isAdmin(auth.state.access.roles)
  })
 

  const route = useRoute()
  const router = useRouter()

  const pagesAll = ref(null)

  onMounted(async () => {
    pagesAll.value = await pages.actions.read()
  })
  // /////////////////////////////////////////
  // Publication Popup
  // /////////////////////////////////////////
  const newPage = ref({
    url: null,
    name: null,
    parent: null,
    content: []
  })

  const isPublicationPopup = ref(false)

  function openPulicationPopup(page) {
    isPublicationPopup.value = true;

    newPage.value.parent = page
  }
  function closePublicationPopup() {
    isPublicationPopup.value = false;

    newPage.value = {
      url: null,
      name: null,
      parent: null,
      content: []
    }
  }

  async function onSubmit() {
    newPage.value.name = newPage.value.content[0].content
    newPage.value.url = newPage.value.parent.url + '/' + normalizeUrlParam(newPage.value.name)
    newPage.value.parent = newPage.value.parent._id
  
    await pages.actions.create(newPage.value)

    router.push(router.resolve({ name: 'Backoffice Pages Edit', params: { url: newPage.value.url.split('/') } }).href)
  }


</script>