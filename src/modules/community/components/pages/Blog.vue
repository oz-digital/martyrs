<template>
  <section>
    <Feed
      v-model:sort="blog.state.sort"
      :showLoadMore="false"
      :states="{
        empty: {
          title: 'No Blog Posts Found',
          description: 'Currently, there are no posts available in this blog. Please check back later.'
        },
      }"
      :store="{
        read: (options) => blog.read(options)
      }"
      :options="{
        limit: 15,
        category: route.params.category,
        period: route.query.period,
        status: 'published',
        user: auth.state.user._id,
        following: route.params.category === 'following' ? auth.state.user._id : null,
      }"
      v-slot="{ 
        items 
      }"
      class="rows-1 gap-thin"
    >
      <CardBlogpost 
        v-for="item in items" 
        :key="item._id" 
        :blogpost="item" 
        :user="auth.state.user._id" 
        class="h-max-40r bg-light mn-b-thin radius-medium mobile:radius-zero"
      />
    </Feed>
  </section>
</template>


<script setup="props">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue';

  // Import state
  import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
  import * as auth  from '@martyrs/src/modules/auth/views/store/auth.js'

  // State
  const route = useRoute();
  const router = useRouter();

  // if (!route.params.category) {
  //   route.params.category = 'popular'
  // }
 
  onMounted(() => {

    if (route.query) {
      const query = route.query;

      const newFilterValue = {
        tags: query.tags ? query.tags.split(',') : [],
        period: query.period ? query.period : null,
      };

      // проверяем наличие категории в route.params и добавляем ее в фильтр
      // if (route.params.category) {
      //   newFilterValue.category = route.params.category;
      // }

      blog.state.filter = newFilterValue;
    }
    
  });

  watch(() => blog.state.filter, (newFilterValue, oldFilterValue) => {
    // Переводим фильтр в формат query
    const query = { ...route.query };

    // Удаляем старые значения фильтра из query
    Object.keys(oldFilterValue).forEach(key => {
      if (query[key]) {
        delete query[key];
      }
    });

    // Добавляем новые значения фильтра в query
    const newQueryValues = Object.fromEntries(
      Object.entries(newFilterValue)
        .filter(([key, value]) => (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value))
        .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
    Object.assign(query, newQueryValues);

    // Обновляем маршрут с новым query
    router.replace({ query });
  }, { deep: true })
</script>

<style lang="scss">

</style>
