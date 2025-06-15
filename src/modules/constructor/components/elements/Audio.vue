<template>
  <div 
    class="mn-b-thin w-100 radius-medium"
  >
      
    <div v-if="prop.content" class="flex-center flex">
      <audio controls class="w-100 h-max-30r">
        <source :src="prop.content" type="video/mp4">
        Your browser does not support the video tag.
      </audio>
    </div>

    <div
      v-else
    >
      <Upload 
        v-model:field="audioUrl"
        @file-change="onComponentSave"
        type="audio"   
        :placeholder="'Upload video'" 
        class="
          w-100
          br-solid
          br-1px
          br-black-transp-10
          pd-medium
          radius-small
          mn-b-thin
        "
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import Upload         from '@martyrs/src/components/Upload/Upload.vue'

const audioUrl = ref(null);
const fileInput = ref(null);

const props = defineProps([
  'label',
  'value',
  'prop'
]);

const emit = defineEmits(['input', 'updateBlock']);

function updateBlock(updatedBlock) {
  const index = post.value.content.findIndex(block => block === updatedBlock);
  if (index !== -1) {
    post.value.content.splice(index, 1, updatedBlock);
  }
}


function onComponentSave(url) {
  audioUrl.value = url

  if (audioUrl.value ) {
    emit('input', audioUrl.value);
    emit('updateBlock', props.prop, { content: audioUrl.value });
  } else {
    alert('Invalid embed code or source not allowed.');
  }
}

</script>