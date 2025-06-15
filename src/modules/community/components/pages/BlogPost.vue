<template>
  <section>
    <TransitionGroup tag="ul" name="fade" class="o-hidden bg-light radius-medium">
      <SkeletonBlogpost
        v-if="isLoading"
        v-for="i in 3" :key="i"
        class=""
      />
    </TransitionGroup>
    <transition 
      name="fade"
    >
      <EmptyState 
        v-if="!isLoading && !blogpost"
        title="No Blogpost Found"
        description="Currently, there are no blogposts available. Please check back later."
        class="pd-medium mn-b-thin bg-light radius-big"
      />
    </transition>

    <TransitionGroup tag="div" name="fade" class="container">
    	  <!-- <button @click="share" >
			    Поделиться
			  </button>
			   -->
      	<CardBlogpost 
          v-if="!isLoading && blogpost"
          @click="$router.push({name: 'Blogpost', params: {url: blogpost.url}})" 
          :blogpost="blogpost" 
          :user="auth.state.user._id"
          :type="'blogpostPage'"
          :hideTitle="true"
          class="mn-b-regular  bg-light radius-medium"
        >

  	      <Viewer
  	        v-if="blogpost && blogpost.content"
  	        :content="blogpost.content"
  	      />

  				<a v-if="blogpost.source" :href="blogpost.source" target="_blank" class="mn-b-semi d-block w-max radius-big pd-thin bg-black t-white">
  					Check Source 🔗
  				</a>
  			
      </CardBlogpost>

     	<!-- <h3 class="mn-b-small">Recommended Communities</h3>
  		<Publics 
  			class="mn-b-small"
  		/> -->

      <Comments 
        v-if="!isLoading && blogpost" 
        :type="'blogpost'" 
        :target="blogpost._id" 
        :owner="auth.state.user._id"
      />
      
    </TransitionGroup>  
  
  </section>
</template>

<script setup>
import { ref, onMounted, computed, onServerPrefetch, watch } from 'vue';
import { useHead } from '@unhead/vue'
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';
import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue';
import SkeletonBlogpost from '@martyrs/src/modules/icons/skeletons/SkeletonBlogpost.vue'
import Publics from '@martyrs/src/modules/organizations/components/sections/Publics.vue'
import Comments from '@martyrs/src/modules/community/components/sections/Comments.vue';
import Viewer from '@martyrs/src/modules/constructor/components/sections/Viewer.vue';
import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  
import { useRoute } from 'vue-router';

const route = useRoute();
const blogpost = computed(() => blog.state.current);
const isLoading = ref(false);
const canShare = ref(false);
const error = ref(null);

async function fetchBlogpost() {
  try {
    isLoading.value = true;
    const data = await blog.read({ user: auth.state.user?._id, url: route.params.url });
    blogpost.value = data[0];
    // Обновляем состояние хранилища
    blog.state.current = data[0];
  } catch (err) {
    error.value = err;
    console.error('Error fetching blogpost:', err);
  } finally {
    isLoading.value = false;
  }
}

onServerPrefetch(async() => {
	await fetchBlogpost()
});

onMounted(async() => {
  if (!blogpost.value || blogpost.value.url !== route.params.url) {
    await fetchBlogpost();
  }
  canShare.value = !!navigator.share;
});


const share = async () => {
  if (!canShare.value) return;
  try {
    await navigator.share({
      title: blogpost.value.name,
      text: firstText.value?.content.slice(0, 120) || 'Check out this blog post!',
      url: window.location.href,
    });
    console.log('Content shared successfully');
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

const firstImage = computed(() => {
  return blogpost.value?.content?.find(block => block.type === 'ImageUpload');
});

const firstText = computed(() => {
  return blogpost.value?.content?.find(block => 
    block.type === 'Textarea' && block.class !== 'h2'
  );
});

const metadata = computed(() => ({
  title: blogpost.value?.name,
  description: firstText.value?.content.slice(0, 120),
  meta: [
    { hid: 'description', name: 'description', content: firstText.value?.content.slice(0, 120) },
    { hid: 'og:title', property: 'og:title', content: blogpost.value?.name },
    { hid: 'og:description', property: 'og:description', content: firstText.value?.content.slice(0, 120) },
    { hid: 'og:image', property: 'og:image', content: firstImage.value?.content ? `${process.env.FILE_SERVER_URL}${firstImage.value.content}` : `${process.env.FILE_SERVER_URL}/favicon/cover.jpg` },
    { hid: 'twitter:title', name: 'twitter:title', content: blogpost.value?.name },
    { hid: 'twitter:description', name: 'twitter:description', content: firstText.value?.content.slice(0, 120) },
    { hid: 'twitter:image', name: 'twitter:image', content: firstImage.value?.content ? `${process.env.FILE_SERVER_URL}${firstImage.value.content}` : `${process.env.FILE_SERVER_URL}/favicon/cover.jpg` },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
  ],
}));

useHead(metadata);
</script>

<style lang="scss">

</style>
