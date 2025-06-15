<template>
  <div id="comments">
    <div class="mn-b-medium">
      <h3 class="mn-b-small">{{ comments.length }} comments</h3>

      <div @click="$router.push({name: 'Sign In'})" class="pd-big cursor-pointer mn-b-small bg-black t-white flex-center flex radius-big" v-if="!owner">
        <p class="t-semi uppercase">Please log in to leave a comment.</p>
      </div>

      <div class="mn-b-small" v-if="owner">
        <form @submit.prevent="submitComment" class="bg-light radius-medium pd-medium">
          <textarea v-model="commentContent" placeholder="Enter your comment" class="p-big w-100"></textarea>
          <button type="submit" class="mn-l-auto bg-main pd-r-regular pd-l-regular pd-thin button">Send</button>
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
        class="comment bg-light pd-medium mn-b-small radius-medium"
      />
  </div>
</template>

<script setup="props">
import { ref } from 'vue';
import axios from 'axios';

import Comment from './Comment.vue';

const props = defineProps([
  'target', 
  'owner', 
  'type'
])

const $axios = axios.create({ baseURL: process.env.API_URL });
const comments = ref([]);
const commentContent = ref('');

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

const handleReply = async (parentId, content) => {
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

    // Обновляем дерево комментариев
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

    // Обновляем дерево комментариев
    updateCommentTree(comments.value, commentId, response.data, response.data.hasMore, true);
  } catch (error) {
    console.error('Error loading more comments:', error);
  }
};

const updateCommentTree = (comments, parentId, newData, hasMore, isLoadMore = false) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i]._id === parentId) {
      if (isLoadMore) {
        // Для загрузки дополнительных комментариев, добавляем их к существующим
        comments[i].children = [...comments[i].children, ...newData];
        comments[i].hasMore = hasMore;
      } else {
        // Для нового комментария, добавляем его в начало списка дочерних
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


const submitComment = async () => {
  if (!commentContent.value) {
    return;
  }
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

fetchComments();
</script>
