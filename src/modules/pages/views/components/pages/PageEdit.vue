<template>
  <!-- Toolbar -->
  <div v-if="page">
    <section v-if="page" class="w-100 mn-b-thin bg-light pd-big radius-semi">
      <Constructor 
        :content="page.content"
        @update="update => page.content = update"
      />
    </section>
   
    <section v-if="page" class="pos-sticky pos-l-0 pos-b-0 w-100 ">
      <div class="pd-thin radius-big  bg-main w-100 flex-nowrap flex">
  
       <Button 
        v-if="route.params.url"
        :submit="() => onDelete()" 
        :callback="() => deletePageCallback()" 
        class="t-nowrap bg-second w-max"
      >
        Delete
      </Button>

       <Button 
        :submit="() => onSubmit()" 
        class="mn-l-auto t-nowrap t-white bg-black w-max"
      >
        Save
      </Button>
     </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useGlobalMixins } from "@martyrs/src/modules/core/views/mixins/mixins.js"

const { 
  normalizeUrlParam, 
  joinArrayToUrl
} = useGlobalMixins()


import { state, actions } from '../../store/pages'

import Button  from '@martyrs/src/components/Button/Button.vue'
import Field from "@martyrs/src/components/Field/Field.vue"; 
import CardPage from '../blocks/CardPage.vue'
import Block from '@martyrs/src/components/Block/Block.vue';

import Constructor from '@martyrs/src/modules/constructor/components/sections/Constructor.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'

// import EditCategories from '@martyrs/src/modules/products/components/blocks/EditCategories.vue'

const route = useRoute()
const router = useRouter()

const page = ref(null)

onMounted(async () => {
  let url

  if (route.params.url) {
    url = route.params.url

    if (url.length > 0) url = joinArrayToUrl(url)
  }

  if (url) {
    try {
      page.value = await actions.read({url: url})
    } catch (error) {
      console.log('error', error)
    }
  } else {
    page.value = state.current
  }
})

async function onSubmit() {
  page.value.name = page.value.content[0].content
  if (!page.value.url) page.value.url = normalizeUrlParam(page.value.name)

  try {
    if (route.params.url) {
      await actions.update(page.value)
    } else {
      await actions.create(page.value)
    }
  } catch (error) {
    console.log('error', error)
  }

  router.push(router.resolve({ name: 'Backoffice Pages Edit', params: { url: page.value.url.split('/') } }).href)

}

function createPageCallback() {
  router.push(router.resolve({ name: 'Backoffice Pages Edit', params: { url: newPage.value.url.split('/') } }).href)
}

async function onDelete() {
  try {
    await actions.delete(page.value)
  } catch (error) {
    console.log('error', error)
  }
}

function deletePageCallback() {
  if (page.value.parent) {
    router.push(router.resolve({ name: 'Backoffice Pages Edit', params: { url: page.value.parent.url.split('/') } }).href)
  } else {
    router.push({ name: 'Backoffice Pages'})
  }
}
</script>