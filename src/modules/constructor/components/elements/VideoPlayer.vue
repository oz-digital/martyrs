<template>
  <div 
    class="mn-b-thin w-100 o-hidden bg-black radius-medium"
  >
      
    <div v-if="prop.content" class="flex-center flex">
      <video controls class="w-100 h-max-30r">
        <source :src="prop.content" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import Upload         from '@martyrs/src/components/Upload/Upload.vue'

const imageUrl = ref(null);
const fileInput = ref(null);

const props = defineProps([
  'label',
  'value',
  'prop'
]);

const emit = defineEmits(['input', 'updateBlock']);

function isValidEmbedCode(code) {
  const allowedSources = [/youtube\.com/, /soundcloud\.com/, /vimeo\.com/];
  return allowedSources.some(pattern => pattern.test(code));
}


function updateBlock(updatedBlock) {
  const index = post.value.content.findIndex(block => block === updatedBlock);
  if (index !== -1) {
    post.value.content.splice(index, 1, updatedBlock);
  }
}


function onComponentSave(url) {
  console.log(imageUrl.value )

  imageUrl.value = url

  if (imageUrl.value ) {
    emit('input', imageUrl.value);
    emit('updateBlock', props.prop, { content: imageUrl.value });
  } else {
    alert('Invalid embed code or source not allowed.');
  }
}

</script>

