<template>
  <footer class="t-semi br-top-dark flex-nowrap flex-nojustify flex">
    👁️ {{ views }}
    <span class="mn-r-small mn-l-small d-block">·</span>
    <div class="cursor-pointer">
      <div class="cursor-pointer" @click="addReaction('like')" v-if="!isReacted">
        👍 {{ reactionsCount }}
      </div>
      <div class="cursor-pointer" @click="deleteReaction('like')" v-if="isReacted">
        👍 {{ reactionsCount }}
      </div>
    </div>
    <span class="mn-r-small mn-l-small d-block">·</span>
    💬 {{ commentsCount }}
  </footer>
</template>

<script setup="props">
  import { computed, ref } from 'vue'

  import * as reactions from '@martyrs/src/modules/community/store/reactions.js';

  const props = defineProps(['entity', 'entityType', 'user']);
 
  const reactionsCount = ref(props.entity.numberOfReactions);
  const isReacted = ref(props.entity.isReacted);
  const reactionId = ref(props.entity.reactionId);

   async function addReaction(type) {
    if (!props.user) {
      alert('Please login to add a reaction');
      return;
    }

    try {
      const reaction = {
        target: props.entity._id,
        type: props.entityType,
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
