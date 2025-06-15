<template>
  <div>
    <CardHeader 
      class="mn-b-thin w-100"
      :entity="comment"
      :entityType="'comment'"
      :user="owner"
      :owner="{target: comment.owner, type: 'user'}" 
      :creator="{target: comment.owner, type: 'user'}"
      :date="comment.createdAt"
    />
    <div class="pd-t-zero">
      <p class="p-medium">{{ comment.content }}</p>
    </div>

    <div class="mn-t-thin flex-v-center flex-nowrap flex gap-small">
      
      <button 
        v-if="totalReplies > 0" 
        @click="toggleChildren"
        class="t-second cursor-pointer t-medium  font-second"
      >
        {{ isExpanded ? 'Hide' : totalReplies + (totalReplies === 1 ? ' reply' : ' replies') }} 
      </button>

      <button 
        v-if="owner" 
        class="font-second cursor-pointer t-transp t-medium" 
        @click="showReplyForm = true"
      > 
        Reply
      </button>
    
    </div>

     <div v-if="showReplyForm" class="mn-t-small bg-white pd-thin radius-regular">
        <textarea class="w-100" v-model="replyContent"></textarea>
        <div class="mn-l-auto gap-thin flex-nowrap flex">
          <button class="bg-grey-transp-25 pd-r-regular pd-l-regular pd-thin button" @click="submitReply">Cancel</button>
          <button class="bg-main pd-r-regular pd-l-regular pd-thin button" @click="submitReply">Send</button>
        </div>
      </div>

    <div v-if="isExpanded && comment.children && comment.children.length" class="br-solid br-l br-grey-transp-25">
      <Comment
        v-for="childComment in comment.children"
        :key="childComment._id"
        :comment="childComment"
        :target="target"
        :owner="owner"
        @reply="handleReply"
        @load-more="handleLoadMore"
        class="mn-l-medium mn-t-small "
      />
    </div>
   
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import Comment from './Comment.vue';

import CardHeader  from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['reply', 'load-more']);

const showReplyForm = ref(false);
const replyContent = ref('');
const isExpanded = ref(shouldBeExpanded(props.comment.depth))

function shouldBeExpanded(depth) {
  return depth % 3 < 2
}

const totalReplies = computed(() => {
  function countReplies(comment) {
    if (!comment.children || comment.children.length === 0) {
      return 0
    }
    return comment.children.length + comment.children.reduce((sum, child) => sum + countReplies(child), 0)
  }
  return countReplies(props.comment)
})

const toggleChildren = () => {
  isExpanded.value = !isExpanded.value
}

const submitReply = () => {
  emit('reply', props.comment._id, replyContent.value);
  replyContent.value = '';
  showReplyForm.value = false;
};

const handleReply = (parentId, content) => {
  emit('reply', parentId, content);
};

const loadMoreChildren = () => {
  emit('load-more', props.comment._id, props.comment.depth + 1);
};

const handleLoadMore = (commentId, depth) => {
  emit('load-more', commentId, depth);
};
</script>