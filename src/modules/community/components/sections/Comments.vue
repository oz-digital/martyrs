<template>
  <div id="comments">
    <div class="mn-b-medium">
      
      <h3 class="mn-b-regular">{{ comments.length }} comments</h3>

      <div class="mn-b-small">
        <form @submit.prevent="handleCommentSubmit" class="bg-white radius-medium pd-medium">
          <textarea 
            v-model="commentContent" 
            placeholder="Enter your comment" 
            class="p-semi w-100"
            style="resize: none;"
          ></textarea>
          <button type="submit" class="mn-l-auto bg-main pd-r-regular pd-l-regular pd-thin button">
            Send
          </button>
        </form>
      </div>
    </div>

    <Comment
      v-for="comment in comments"
      :key="comment._id"
      :comment="comment"
      :target="target"
      :type="type"
      :owner="owner"
      @reply="handleReply"
      @load-more="loadMoreChildren"
      class="comment mn-b-medium"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { Preferences } from '@capacitor/preferences';

import Comment from './Comment.vue';
import $axios from '@martyrs/src/modules/globals/views/utils/axios-instance.js';

const props = defineProps([
  'target', 
  'owner', 
  'type'
]);

const route = useRoute();
const { proxy } = getCurrentInstance();

const comments = ref([]);
const commentContent = ref('');

const DRAFT_KEY = `comment_draft_${props.type}_${props.target}`;

// Загружаем сохраненный черновик при монтировании
onMounted(async () => {
  // Проверяем наличие черновика
  const { value } = await Preferences.get({ key: DRAFT_KEY });
  
  if (value) {
    commentContent.value = value;
    // Очищаем черновик после загрузки
    await Preferences.remove({ key: DRAFT_KEY });
  }
});

const fetchComments = async () => {
  try {
    const response = await $axios.get('/comments/read', {
      params: {
        target: props.target,
        type: props.type,
        user: props.owner,
        format: 'tree',
        maxDepth: 2
      }
    });
    comments.value = response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const handleCommentSubmit = async () => {
  if (!commentContent.value) {
    return;
  }

  // Проверяем авторизацию
  if (!props.owner) {
    // Сохраняем черновик
    await Preferences.set({
      key: DRAFT_KEY,
      value: commentContent.value
    });
    
    // Показываем auth popup
    await proxy.$showAuth({
      title: 'Join the discussion',
      subtitle: 'To comment on this post, please sign in or create an account.',
      returnUrl: route.fullPath
    });
    
    return;
  }

  // Отправляем комментарий
  await submitComment();
};

const submitComment = async () => {
  try {
    const response = await $axios.post('/comments/create', {
      target: props.target,
      user: props.owner,
      type: props.type,
      content: commentContent.value,
      creator: {
        target: props.owner,
        type: 'User',
        hidden: false
      },
      owner: {
        target: props.owner,
        type: 'User'
      }
    });

    response.data.owner = props.owner;
    comments.value.push(response.data);

    commentContent.value = '';
  } catch (error) {
    console.error(error);
  }
};

const handleReply = async (parentId, content) => {
  // Проверяем авторизацию для ответов
  if (!props.owner) {
    // Сохраняем черновик ответа
    await Preferences.set({
      key: `${DRAFT_KEY}_reply_${parentId}`,
      value: content
    });
    
    await proxy.$showAuth({
      title: 'Join the discussion',
      subtitle: 'To reply to this comment, please sign in or create an account.',
      returnUrl: route.fullPath
    });
    
    return;
  }

  try {
    const response = await $axios.post('/comments/create', {
      content,
      target: props.target,
      type: props.type,
      user: props.owner,
      parent: parentId,
      format: 'tree',
      creator: {
        target: props.owner,
        type: 'User',
        hidden: false
      },
      owner: {
        target: props.owner,
        type: 'User'
      }
    });

    const newComment = response.data;
    updateCommentTree(comments.value, parentId, newComment);
  } catch (error) {
    console.error('Error posting reply:', error);
  }
};

const loadMoreChildren = async (commentId, depth) => {
  try {
    const response = await $axios.get('/comments/read', {
      params: {
        target: props.target,
        type: props.type,
        user: props.owner,
        parentId: commentId,
        depth: depth,
        maxDepth: 10
      }
    });

    updateCommentTree(comments.value, commentId, response.data, response.data.hasMore, true);
  } catch (error) {
    console.error('Error loading more comments:', error);
  }
};

const updateCommentTree = (comments, parentId, newData, hasMore, isLoadMore = false) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i]._id === parentId) {
      if (isLoadMore) {
        comments[i].children = [...comments[i].children, ...newData];
        comments[i].hasMore = hasMore;
      } else {
        comments[i].children.push(newData);
      }
      return true;
    }
    if (comments[i].children && updateCommentTree(comments[i].children, parentId, newData, hasMore, isLoadMore)) {
      return true;
    }
  }
  return false;
};

fetchComments();
</script>