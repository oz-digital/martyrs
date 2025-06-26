<template>
  <footer class="t-semi br-top-dark flex-nowrap flex-nojustify flex">
    <router-link :to="{
      name: 'BlogPost', 
      params: { 
        url: blogpost.url 
      }
    }" 
    class="font-second cursor-pointer hover-bg-white pd-l-thin pd-r-thin radius-big">
      👁️ {{blogpost.views}}
    </router-link>
    
    <div class="hover-bg-white pd-l-thin pd-r-thin radius-big cursor-pointer">
      <div class="cursor-pointer" @click="addReaction('like')" v-if="!isReacted">
        👍 {{reactionsCount }}
      </div>
      <div class="cursor-pointer" @click="deleteReaction('like')" v-if="isReacted">
        👍 {{reactionsCount }}
      </div>
    </div>
    <router-link :to="{
      name: 'BlogPost', 
      hash: '#comments',
      params: { 
        url: blogpost.url 
      }
    }" 
    class="font-second cursor-pointer hover-bg-white pd-l-thin pd-r-thin radius-big">
      💬 {{ blogpost.numberOfComments }}
    </router-link>
  </footer>
</template>

<script setup="props">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import * as reactions from '@martyrs/src/modules/community/store/reactions.js';

const props = defineProps(['blogpost', 'owner', 'user']);

const reactionsCount = ref(props.blogpost.numberOfReactions);
const isReacted = ref(props.blogpost.isReacted);
const reactionId = ref(props.blogpost.reactionId);

async function addReaction(type) {
  if (!props.user) {
    alert('Please login to add a reaction');
    return;
  }

  try {
    const reaction = {
      target: props.blogpost._id,
      type: 'blogpost',
      user: props.user,
      class: 'like'
    };
    const res = await reactions.actions.create(reaction);

    if (res.reaction.class === 'like') {
      reactionsCount.value += 1;
      isReacted.value = true;
      reactionId.value = res.reaction._id;
    }
  } catch (err) {
    console.error(err);
    alert('Error adding reaction. Please try again later.');
  }
}

async function deleteReaction(type) {
  if (!props.user) {
    alert('Please login to add a reaction');
    return;
  }

  try {
    const reaction = { _id: reactionId.value };

    await reactions.actions.delete(reaction);

    reactionsCount.value -= 1;
    isReacted.value = false;
    reactionId.value = null;
  } catch (err) {
    alert('Error adding reaction. Please try again later.');
  }
}
</script>

<style lang="scss">
</style>
