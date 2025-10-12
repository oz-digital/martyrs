<template>
  <div class="pos-relative">
    <header 
      v-if="route.name !== 'Organization' && !MOBILE_APP"
      class="pd-medium flex-v-center flex-nowrap flex"
    >
      <h2 class="mn-r-medium">Posts</h2>
      <button 
        v-if="hasAccess(route.params._id, 'posts', 'create', auth.state.accesses, auth.state.access.roles)"
        @click="$router.push({
          name: route.params?._id ? 'Organization_PostAdd' : 'CreateBlogPost'
        })" 
        class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second">
          +
      </button>
    </header>

    <div class="w-100 rows-1 pd-thin pos-relative o-hidden">
        <Feed
          :search="true"
          v-model:filter="blog.state.filter"
          v-model:sort="blog.state.sort"
          :showLoadMore="false"
          :states="{
            empty: {
              title: 'No Blog Posts Found',
              description: 'Currently, there are no posts available in this blog.'
            }
          }"
          :store="{
            read: (options) => blog.read(options),
            state: blog.state
          }"
          :options="{
            limit: 12,
            status: 'published',
            user: auth.state.user._id,
            owner: route.params._id || null,
            search: route.query.search
          }"
          v-slot="{ 
            items 
          }"
          class="cols-1 pos-relative w-100 rows-1 gap-thin"
        >
          <CardBlogpost 
            v-for="item in items" 
            :key="item._id" 
            :blogpost="item" 
            :user="auth.state.user._id" 
            class="h-max-40r bg-light radius-medium cursor-pointer hover-scale-1 transition-all"
            @click="$router.push({ 
              name: route.params._id ? 'Organization_BlogPost' : 'BlogPost', 
              params: { 
                _id: route.params._id,
                url: item.url 
              } 
            })"
          />
        </Feed>

    </div>
  </div>
</template>

<script setup="props">
  // Import libs
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  // Import components
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'

  // Accessing router and store
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as core from '@martyrs/src/modules/core/views/store/core.store.js';
  import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

  const route = useRoute()
  const router = useRouter()
  const { hasAccess } = useGlobalMixins()

  // Props
  const props = defineProps({
    organization: {
      type: Object,
      default: null
    }
  })


  core.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Organization_PostAdd', params: { _id: route.params._id} }) : router.push({ name: 'CreateBlogPost' })
  }]

  onMounted(async () => {
    if (route.params._id) {
      await organizations.actions.read({ _id: route.params._id });
    }
  })

  onUnmounted(() => {
    core.state.navigation_bar.actions = [];
  });
</script>

<style lang="scss">
</style>