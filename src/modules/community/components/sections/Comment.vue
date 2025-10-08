<template>
  <div class="comment-wrapper">
    <div class="comment-content ">
      <CardHeader 
        class="mn-b-thin mn-b-thin w-100"
        :entity="comment"
        :entityType="'comment'"
        :user="owner"
        :owner="{target: comment.owner, type: 'user'}" 
        :creator="{target: comment.owner, type: 'user'}"
        :date="comment.createdAt"
      />
      <div class="pd-t-zero">
        <p class="p-regular">{{ comment.content }}</p>
      </div>
      <div class="mn-t-thin flex-v-center flex-nowrap flex gap-small">
        <button 
          v-if="totalReplies > 0" 
          @click="toggleChildren"
          class="t-second cursor-pointer t-medium font-second"
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
          <button class="bg-grey-transp-25 pd-r-regular pd-l-regular pd-thin button" @click="showReplyForm = false">Cancel</button>
          <button class="bg-main pd-r-regular pd-l-regular pd-thin button" @click="submitReply">Send</button>
        </div>
      </div>
    </div>

    <transition name="collapse">
      <div v-if="isExpanded && comment.children && comment.children.length" class="mn-t-regular comment-children">
        <div
          v-for="(childComment, index) in comment.children"
          :key="childComment._id"
          class="child-wrapper"
        >
          <!-- Кликабельная область с линией -->
          <div 
            @click="toggleChildren" 
             @mouseenter="highlightLevel($event, true)"
            @mouseleave="highlightLevel($event, false)"
            class="tree-line cursor-pointer"
            :class="{ 'last-child': index === comment.children.length - 1 }"
          ></div>
          
          <Comment
            :comment="childComment"
            :target="target"
            :owner="owner"
            @reply="handleReply"
            @load-more="handleLoadMore"
            class="child-comment mn-b-regular"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Comment from './Comment.vue';
import CardHeader from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue'

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


const childrenContainer = ref(null)

function highlightLevel(event, state) {
  const wrapper = event.currentTarget?.parentElement?.parentElement;
  if (!wrapper) return;

  const lines = wrapper.querySelectorAll(':scope > .child-wrapper > .tree-line');
  lines.forEach(line => line.classList.toggle('hovered', state));
} 

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

const handleLoadMore = (commentId, depth) => {
  emit('load-more', commentId, depth);
};
</script>

<style lang="scss" scoped>
.comment-children {
  margin-top: 1rem;
}

.child-wrapper {
  position: relative;
}

.child-comment {
  padding-left: 1.5rem;
}

.tree-line {
  position: absolute;
  left: calc(-1rem + 2px);
  top: -1rem;
  width: 2rem;
  height: calc(100% + 2rem);
}

.tree-line::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  width: 2px;
  height: 100%;
   border-left: 1px solid rgba(var(--grey), 1);
  transition: background 0.2s ease;
}

.tree-line::after {
  content: '';
  position: absolute;
  left: 1rem;
  top: 2rem;
  width: 1rem;
  height: 2px;
  border-bottom: 1px solid rgba(var(--grey), 1);
  transition: background 0.2s ease;

}

.child-wrapper {
  &:last-child {
    .tree-line::after {
      display: none;
    }
  }
}

.tree-line.last-child::before {
  height: 2rem;
  border-bottom-left-radius: 0.5rem;
  border-left: 1px solid rgba(var(--grey), 1);
  border-bottom: 1px solid rgba(var(--grey), 1);
  background: none;
  width: 1rem;
}


.tree-line.hovered::before,
.tree-line.hovered::after {
  border-color: rgba(var(--second), 1);
}

.tree-line.last-child.hovered::before {
  border-color: rgba(var(--second), 1);
}

/* Анимация */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
}

.collapse-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.collapse-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>