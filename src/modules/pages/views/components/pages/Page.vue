<template>
      
  <div v-if="page && page.content"  style="overflow: clip" class=" bg-light pos-relative"> 
    
    <div class="pd-medium pos-sticky mobile-only  z-index-1 pos-t-0 bg-light w-100 br-b br-solid br-black-transp-10">
      <button @click="showMenu" class="cursor-pointer">
        {{ isMenuOpen === false ? 'Show Menu' : 'Hide Menu' }}
      </button>
    </div>

    <div  v-if="isMenuOpen" class="z-index-0  pos-relative">
      <ul 
        class="transition-ease-in-out w-100  bg-light"
      >
        <CardPage 
          :page="pageParent" 
          :hasAdminRights="hasAdminRights"
          class="pd-thin"
        />
      </ul>  
    </div>

    <div  v-if="!isMenuOpen" class="cols-2-1_3 h-100 bg-light z-index-0 pos-relative">

      <div class="desktop-only h-100 bg-white o-scroll z-index-0  pos-relative">
        <ul 
          class="transition-ease-in-out w-100  bg-light"
        >
          <CardPage 
            :page="pageParent" 
            :hasAdminRights="hasAdminRights"
            class="bg-white pd-thin"
          />
        </ul>  
      </div>

      <div class="o-scroll pd-medium">
        <Viewer
          :content="page.content"
          class=""
        />

        <div class="gap-thin cols-2">
          <div  v-if="navigationPages.previousPage" class="bg-white pd-medium mn-b-thin radius-semi ">
            <h4 class="mn-b-small" >Read Previous</h4>

            <CardPage 
              :page="navigationPages.previousPage" 
              :showChildren="false"
              class="h3 t-main bg-white mn-b-thin radius-semi"
            />
          </div>

          <div v-if="navigationPages.children.length > 0" class="bg-white pd-medium mn-b-thin radius-semi ">
            <h4 class="mn-b-small pd-micro ">Table of Contents</h4>
            <CardPage 
              v-for="childPage in navigationPages.children" 
              :key="childPage.id"
              :page="childPage" 
              class="bg-white pd-micro  radius-semi"
            />
          </div>

          <div v-if="navigationPages.nextPage" class="bg-white pd-medium mn-b-thin radius-semi">
            <h4 class="mn-b-small" >Read Next</h4>
            <CardPage 
              :page="navigationPages.nextPage" 
              class="h3 t-main  bg-white mn-b-thin radius-semi"
              :showChildren="false"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
  // Import libs
  import { computed, onMounted, ref, onServerPrefetch } from 'vue'

  import { useRoute } from 'vue-router'
  import { useI18n }    from 'vue-i18n'

  import Viewer from '@martyrs/src/modules/constructor/components/sections/Viewer.vue';

  import CardPage from '../blocks/CardPage.vue'

  import * as pages from '../../store/pages';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

  import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

  const isMenuOpen = ref(false)

  function showMenu () {
    isMenuOpen.value = !isMenuOpen.value
  }

  function flattenTree(tree) {
    const pages = [];

    function recursiveFlatten(nodes, parent = null) {
      for (const node of nodes) {
        pages.push({ ...node, parent }); // Сохраняем родителя для каждого узла
        if (node.children.length > 0) {
          recursiveFlatten(node.children, node);
        }
      }
    }

    recursiveFlatten(tree.children);
    return pages;
  }

  // Получаем плоский список всех страниц
  const allPages = computed(() => flattenTree(pageParent.value));

  // Вычисляемая функция для нахождения предыдущей и следующей страниц
  const navigationPages = computed(() => {
    // Если текущая страница - рутовая
    if (page.value._id === pageParent.value._id) {
      return { children: page.value.children, previousPage: null, nextPage: null };
    }

    const currentIndex = allPages.value.findIndex(p => p._id === page.value._id);
    
    const previousPage = currentIndex > 0 
      ? allPages.value[currentIndex - 1] 
      : pageParent.value;  // Если нет предыдущего, берем родителя
    
    const nextPage = currentIndex < allPages.value.length - 1 
      ? allPages.value[currentIndex + 1] 
      : null;

    return { previousPage, nextPage, children: [] };
  });

  const { 
    normalizeUrlParam, 
    joinArrayToUrl,
    isAdmin
  } = useGlobalMixins()

  const hasAdminRights = computed(() => {
    return isAdmin(auth.state.access.roles)
  })

  const { t, locale } = useI18n()

  const route = useRoute()

  const pageParent = ref(null)
  const page = ref(null)

  onMounted(async () => {
    let urlParent = route.params.url
    if (urlParent.length > 0) urlParent = urlParent[0]

    pageParent.value = await pages.actions.read({url: urlParent})

    let url = route.params.url
    if (url.length > 0) url = joinArrayToUrl(url)
    
    page.value = await pages.actions.read({url: url})  
  })
</script>

<style lang="scss">
</style>
