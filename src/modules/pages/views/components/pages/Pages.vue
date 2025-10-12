<template>
  <div>
    <SectionPageTitle
      title="Pages"
      :actions="[
        { to: { name: 'Backoffice Pages Add'}, label: 'Create Page' }
      ]"
      class="mn-b-small bg-light bg-light radius-big"
    />

    <Block
      v-if="pagesAll"
      class="mn-b-thin cols-1 gap-thin"
    >
      <!-- Objects -->
      <CardPage v-for="page in pagesAll" :page="page" :hasAdminRights="hasAdminRights" class="bg-white pd-thin radius-small"/>
    </Block>
  </div>
</template>

<script setup>
  import { onMounted, ref, toRefs, computed } from 'vue'
  
  import { useRoute,useRouter } from 'vue-router'

  import Block from '@martyrs/src/components/Block/Block.vue';
  import SectionPageTitle from '@martyrs/src/modules/core/views/components/sections/SectionPageTitle.vue'

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

</script>

<style lang="scss">
  
</style>
