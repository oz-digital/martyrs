<template>
  <div>
    <div :class="$attrs.class">
      <!-- {{ page.url }} -->
      <div class="flex flex-nowrap gap-thin card-page-title">
        <router-link
          :to="router.resolve({ name: 'Page', params: { url: page.url.split('/') } }).href" 
           class="
            z-index-2
            cursor-pointer
            mn-r-auto
            t-truncate
          "
          :class="{
            't-main': $route.params.url && page.url === joinArrayToUrl($route.params.url)
          }"
        >
          {{ page.name }}
        </router-link>

        <router-link
          v-if="hasAdminRights"
          :to="router.resolve({ name: 'Backoffice Pages Edit', params: { url: page.url.split('/') } }).href" 
          class="
            z-index-2
            cursor-pointer 
            card-page-actions
            radius-extra pd-micro bg-second
          "
        >
          <IconEdit
            class="i-small"
            classes="fill-white"
          />
        </router-link>

        <button
           v-if="hasAdminRights"
          @click="createPage(page)"
          class="
            z-index-2
            cursor-pointer 
            card-page-actions
            radius-extra pd-micro bg-second
          "
        >
          <IconAdd
            class="i-small"
            :fill="'white'"
          />
        </button>
      </div>
    </div>

    <div v-if="page.children && page.children.length > 0 && page.children[0].url && showChildren" class="mn-l-small br-t br-solid br-black-transp-10">
      <CardPage 
        @createPage="createPage" 
        v-for="childPage in page.children" 
        :key="childPage.url" 
        :page="childPage" 
        :hasAdminRights="hasAdminRights"
        :class="$attrs.class"
      />
    </div>
    
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
  import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'

  import Button  from '@martyrs/src/components/Button/Button.vue'
  import Field from "@martyrs/src/components/Field/Field.vue"; 

  import { useRouter } from 'vue-router'
  
  const router = useRouter()

  const props = defineProps({
    page: {
      type: Object,
      required: true
    },
    hasAdminRights: {
      type: Boolean,
      default: false
    },
    showChildren: {
      type: Boolean,
      default: true
    }
  })

  const emits = defineEmits([
    'createPage'
  ])

  const newPage = ref({
    show: false,
    name: null
  })

  async function createPage(page) {
    emits('createPage', page)
  }
</script>

<style lang="scss">
.card-page-title {
  .card-page-actions {
    display: none;
  }

  &:hover {
    .card-page-actions {
      display: block;
    }
  }
}
</style>